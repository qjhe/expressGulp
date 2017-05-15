
var gulp = require('gulp');
var clean = require('gulp-clean');                                  //清理文件或文件夹
var minify = require('gulp-uglify');                            //- 压缩js；
//var concat = require('gulp-concat');                            //- 多个文件合并为一个；
var minifyCss = require('gulp-minify-css');                     //- 压缩CSS为一行；
var rev = require('gulp-rev');                                  //- 对文件名加MD5后缀
var revAppend = require('gulp-rev-append');                                  //- 给URL自动添加MD5版本号
var revCollector = require('gulp-rev-collector');               //- 路径替换
var replace = require('gulp-replace');                          //替换地址
var runSequence = require('gulp-run-sequence');
var revFormat = require('gulp-rev-format');
var revReplace = require('gulp-rev-replace');

/*=====================清理构建目录==========================*/
gulp.task('clean', function () {
    return gulp.src('dist/', {read: false})
        .pipe(clean());
});

/*=====================copy其他静态资源文件==========================*/
gulp.task('copy', function() {
    return gulp.src(['src/**/*'])
        .pipe(gulp.dest('dist'))
});

/*=====================压缩js==========================*/
gulp.task('js', function(){
    return gulp.src('dist/static/js/!(lib)/**/*.js') // 匹配
        .pipe(minify())
        //.pipe(rev())
        .pipe(gulp.dest('dist/static/js'));  // 写入 'dist/js'
});

/*=====================压缩css==========================*/
gulp.task('concat', function(){
    return gulp.src(['dist/static/css/**/*.css'])  //- 需要处理的css文件，放到一个字符串数组里
        .pipe(minifyCss())                                      //- 压缩处理成一行
        .pipe(gulp.dest('dist/static/css'))                               //- 输出文件本地
});

/*=====================压缩html==========================*/
gulp.task('miniHtml', function() {
    return gulp.src('dist/views/*.hbs')
        .pipe(revAppend())
        .pipe(gulp.dest('dist/views/'));
});

/*=====================生成版本号清单==========================*/
gulp.task('rev', function() {
    return gulp.src(['dist/static/!(lib)/**/*.*'])
    .pipe(rev())
    .pipe(revFormat({
        prefix: '.', // 在版本号前增加字符
        suffix: '.cache', // 在版本号后增加字符
        lastExt: false
    }))
    .pipe(rev.manifest())
    .pipe(gulp.dest("config/"));
});

/*=====================路径替换==========================*/
gulp.task('update-version', function() {
    return gulp.src(['config/*.json','dist/views/**/*'])
        .pipe(revCollector())//- 根据 .json文件 执行文件内css名的替换
        .pipe(gulp.dest('dist/views'));
});

gulp.task('build', function(done) {
    runSequence(
        ['clean'],
        ['copy'],
        ['js','concat'],
        ['rev'],
        ['update-version'],
        done);
});
gulp.task('expressgulp', ['build']);

