var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function() {
	gulp.src('./src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({ stage: 0, optional: ['runtime', 'bluebirdCoroutines'] }))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['default']);