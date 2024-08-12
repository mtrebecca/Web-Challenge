const gulp = require('gulp');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();

gulp.task('styles', function() {
    return gulp.src('public/styles/less/**/*.less')
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('public/styles/css'))
        .pipe(browserSync.stream());
});

gulp.task('serve', function() {
    browserSync.init({
        server: "./public"
    });

    gulp.watch('public/styles/less/**/*.less', gulp.series('styles'));
    gulp.watch('public/**/*.html').on('change', browserSync.reload);
});

gulp.task('default', gulp.series('styles', 'serve'));
