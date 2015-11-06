var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('default', function() {
	gulp.src('./src/**/*.js')
		.pipe(babel({ stage: 0, optional: ['runtime'] }))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['default']);