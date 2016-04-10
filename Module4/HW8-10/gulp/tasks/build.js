'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');

gulp.task('build', function () {
    runSequence(['html', 'styles', 'fonts', 'img', 'server']);
});