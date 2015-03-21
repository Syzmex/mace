
'use strict';

var del = require( 'del' );
var gulp = require( 'gulp' );
var concat = require( 'gulp-concat' );
var rename = require( 'gulp-rename' );
var uglify = require( 'gulp-uglify' );
var buildpath = 'build';


gulp.task( 'outputJs', function () {
  gulp.src( [
      'src/core.js',
      'src/utils.js',
      'src/class.js',
      'src/mace.js' ] )
    .pipe( concat( 'mace.js' ) )
    .pipe( gulp.dest( buildpath ) )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( uglify() )
    .pipe( gulp.dest( buildpath ) );
} );


gulp.task( 'clean', function ( cb ) {
  del( [ 'build/*' ], cb );
} );


gulp.task( 'default', [ 'clean' ], function () {
  gulp.start( 'outputJs' );
} );