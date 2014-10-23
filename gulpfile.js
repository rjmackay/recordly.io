var gulp = require('gulp'),
	sass = require('gulp-sass'),
	livereload = require('gulp-livereload'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	source = require('vinyl-source-stream'),
	browserify = require('browserify'),
	watchify = require('watchify'),

	browserifyConfig = {
		entries : './client/js/app.js',
		debug : true
	}
;

function errorHandler (err) {
  gutil.beep();
  gutil.log(err.message || err);
}

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

/**
 * Task: `browserify`
 * Bundle js with browserify
 */
gulp.task('browserify', function() {
    browserify(browserifyConfig)
        .transform('brfs')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/js'));
});

/**
 * Task: `watchify`
 * Watch js and rebundle with browserify
 */
gulp.task('watchify', function() {
    var bundler = watchify(browserify(browserifyConfig, watchify.args))
    .transform('brfs')
    .on('update', rebundle);

    function rebundle () {
        return bundler.bundle()
            .on('error', errorHandler)
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('public/js'));
    }
});

gulp.task('lint', function() {
	gulp.src(['./public/js/main.js', 'client/js/**/*.js', './*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('watch', ['watchify'], function(){
	livereload.listen();
	gulp.watch('./public/scss/**/*.scss', ['sass']);
	gulp.watch(['./public/js/main.js', 'client/js/**/*.js', './*.js'], ['lint']);
	gulp.watch(['./public/*.html', './public/js/*.js', './public/css/*.css'])
		.on('change', livereload.changed);
});

gulp.task('default', function() {
	// place code for your default task here
});

gulp.task('build', ['sass', 'browserify'], function() {
	// place code for your default task here
});
