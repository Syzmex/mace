
'use strict';


var gulp = require( 'gulp' );
var csso = require( 'gulp-csso' );
var concat = require( 'gulp-concat' );
var rename = require( 'gulp-rename' );
var uglify = require( 'gulp-uglify' );
var htmlmin = require( 'gulp-htmlmin' );
var buildpath = 'build';


gulp.task( 'jsmin', function () {
  return gulp.src( 'src/**/*.js' )
    .pipe( uglify() )
    .pipe( gulp.dest( buildpath ) );
} );


gulp.task( 'cssmin', function () {
  return gulp.src( 'src/**/*.css' )
    .pipe( csso() )
    .pipe( gulp.dest( buildpath ) );
} );


gulp.task( 'htmlmin', function () {
  return gulp.src( 'src/**/*.html' )
    .pipe( htmlmin() )
    .pipe( gulp.dest( buildpath ) );
} );


gulp.task( 'default', [ 'jsmin', 'cssmin', 'htmlmin' ] );
