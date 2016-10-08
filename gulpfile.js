/**
 * Created by py on 04/10/16.
 */

'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var babelify = require('babelify');

gulp.task('default', function(){
    console.log('running gulp tasks');
});

gulp.task('javascript', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './client/js/client.js',
        debug: true
    });

    return b.transform(babelify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify({mangle: false}))
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./client/dist/'));
});