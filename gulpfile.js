var gulp = require('gulp'),
	sass = require('gulp-sass'),
	livereload = require('gulp-livereload'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint');

function errorHandler (err) {
  gutil.beep();
  gutil.log(err.message || err);
}

gulp.task('default', function() {
	// place code for your default task here
});

gulp.task('sass', function () {
	gulp.src('./public/scss/*.scss')
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(sass({
			includePaths : [
				'public/bower_components/bourbon/dist',
				'public/bower_components/neat/app/assets/stylesheets',
				'public/bower_components/font-awesome/scss'
			],
			outputStyle : (process.env.NODE_ENV === 'production') ? 'compressed' : 'nested'
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./public/css'));
});

gulp.task('lint', function() {
	gulp.src(['./public/js/main.js', './*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('watch', function(){
	livereload.listen();
	gulp.watch('./public/scss/**/*.scss', ['sass']);
	gulp.watch(['./public/js/main.js', './*.js'], ['lint']);
	gulp.watch(['./public/*.html', './public/js/*.js', './public/css/*.css'])
		.on('change', livereload.changed);
});

gulp.task('build', ['sass'], function() {
	// place code for your default task here
});
