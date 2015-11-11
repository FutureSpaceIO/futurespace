'use strict'

const del = require('del')
const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()

const paths = {
  scripts: [
    'public/scripts/**/*.js',
    '!public/scripts/**/*.min.js'
  ],
  styles: [
    'public/styles/**/*.css',
    'public/styles/**/*.scss',
    '!public/styles/**/*.min.css'
  ]
}

gulp.task('clean', function() {
  return del(['assets'])
})

gulp.task('scripts', function() {
  const sourcemaps = plugins.sourcemaps
  const uglify = plugins.uglify
  const concat = plugins.concat
  const babel = plugins.babel

  return gulp.src(paths.scripts)
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(uglify())
  .pipe(concat('app.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('public/scripts'))
})

gulp.task('styles', function() {
  const sourcemaps = plugins.sourcemaps
  const concat = plugins.concat
  const sass = plugins.sass
  const postcss = plugins.postcss
  const autoprefixer = require('autoprefixer')
  const cssnano = require('cssnano')

  return gulp.src(paths.styles)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }), cssnano() ]))
  .pipe(concat('app.min.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('public/styles'))
})
