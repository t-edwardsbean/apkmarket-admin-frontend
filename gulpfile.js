var gulp = require('gulp');//基础库
var uglify = require('gulp-uglify');  //js压缩
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css'); //Css压缩插件
var clean = require('gulp-clean'); //清空文件夹
var browserSync = require('browser-sync');  //livereload
var reload = browserSync.reload;
var output = "./dist/"; // output
var paths = {
    sass: ['./scss/**/*.scss']
};

// tasks
gulp.task('lint', function() {
    gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('minify-css', function() {
    var opts = {comments:true,spare:true};
    gulp.src(['./app/**/*.css', '!./app/bower_components/**'])
        .pipe(minifyCss(opts))
        .pipe(gulp.dest('./dist/'))
});
gulp.task('minify-js', function() {
    gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
        .pipe(uglify({
            // inSourceMap:
            // outSourceMap: "app.js.map"
        }))
        .pipe(gulp.dest('./dist/'))
});
gulp.task('copy-lib', function () {
    gulp.src('./app/bower_components/**')
        .pipe(gulp.dest('dist/bower_components'));
});

gulp.task('copy-html-files', function () {
    gulp.src('./app/**/*.html')
        .pipe(gulp.dest('dist/'));
});

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./app/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./app/css/'))
        .on('end', done);
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
});

// 清空图片、样式、js
gulp.task('clean', function () {
    gulp.src(['./dist/'], {read: false})
        .pipe(clean());
});

// watch Sass files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('serve', ['watch'], function () {
    var files = [
        'app/**/*.*'
    ];

    browserSync(files, {
        server: {
            baseDir: './app'
        }
    });

});

/* 部署环境 */
gulp.task('release',
    ['clean','lint', 'minify-css','minify-js', 'copy-html-files', 'copy-lib']
);