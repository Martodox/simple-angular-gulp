var gulp = require('gulp'),
  sass = require('gulp-sass'),
  minifyCSS = require('gulp-minify-css'),
  concat = require('gulp-concat'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglifyjs'),
  htmlreplace = require('gulp-html-replace'),
  rev = require('gulp-rev'),
  fs = require('fs'),
  path = require('path'),
  runSequence = require('run-sequence'),
  watch = require('gulp-watch'),
  clean = require('gulp-clean');


gulp.task('sass', function () {
  return gulp.src('./scss/app.scss')
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css'))
});

function angularCore() {
  return gulp.src([
    './js/angular/dependencies/**/*.js',
    './js/angular/app/**/*.js'
  ])
    .pipe(concat('all.js'))
    .pipe(ngAnnotate({
      single_quotes: true
    }))
}

gulp.task('angular', function () {
  return angularCore()
    .pipe(gulp.dest('./public/js'));
});

gulp.task('angularUglify', function () {
  return angularCore()
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('clear', function () {
  return gulp.src('./public/build/**/*')
    .pipe(clean({force: true}));
});

gulp.task('revision', function () {
  return gulp.src([
    'public/css/app.css',
    'public/js/all.js'
  ])
    .pipe(rev())
    .pipe(gulp.dest('./public/build'));
});


gulp.task('replace', function () {

  var files = fs.readdirSync('./public/build');
  var list = {};
  files.forEach(function (file) {
    list[path.extname(file).substring(1)] = '/build/' + file;
  });

  return gulp.src('./index.html')
    .pipe(htmlreplace(list))
    .pipe(gulp.dest('./public/'));
});

gulp.task('default', function () {
  runSequence('sass', 'clear', 'angular', 'revision', 'replace');
});

gulp.task('watch', function () {

  runSequence('default');

  watch('./js/angular/**/*.js', function () {
    runSequence('angular', 'clear', 'revision', 'replace');
  });

  watch('./scss/**/*.scss', function () {
    runSequence('sass', 'clear', 'revision', 'replace');
  });


});

