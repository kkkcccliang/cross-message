/**
 * Created by liangjz on 11/30/15.
 */

var gulp = require('gulp');
var del = require('del');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var runSequence = require('gulp-run-sequence');
var util = require('gulp-util');
var rename = require('gulp-rename');
var gulpIf = require('gulp-if');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

function handleError(err) {
    util.log(err.message);
    this.emit('end');
}

function doBundle(isMin) {
    return browserify('./src/cross-message.js')
        .on('error', handleError)
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(rename({
            basename: 'cross-message',
            suffix: isMin ? '.min' : '',
            extname: '.js'
        }))
        .pipe(gulpIf(isMin, buffer())) // <----- convert from streaming to buffered vinyl file object
        .pipe(gulpIf(isMin, uglify()))
        .pipe(gulp.dest('./dist'));
}

gulp.task('pack', function () {
    return doBundle();
});

gulp.task('pack:min', function () {
    return doBundle(true);
});

gulp.task('clean', function () {
    del(['./dist']);
});

gulp.task('build', function (done) {
    return runSequence('clean', ['pack', 'pack:min'], done);
});
