var gulp = require('gulp');

gulp.task('default', function() {
  // place code for your default task here
});

var sass = require('gulp-sass');
gulp.task('sass', function () {
    gulp.src('./public/scss/*.scss')
        .pipe(sass({
        	includePaths : [
        		'public/bower_components/bourbon/dist',
        		'public/bower_components/neat/app/assets/stylesheets',
        		'public/bower_components/font-awesome/scss'
        	],
        	outputStyle : 'nested'
        }))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function(){
    gulp.watch('./public/scss/**/*.scss', ['sass']);
});

gulp.task('build', ['sass'], function() {
  // place code for your default task here
});
