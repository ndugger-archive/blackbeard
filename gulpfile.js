var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function() {
	gulp.src('./src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({ stage: 0, optional: ['runtime'] }))
		.pipe(uglify())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['default']);