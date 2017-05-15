
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
    gulp.src('dist/static/js/**/*.js') // 匹配
        .pipe(minify())
        //.pipe(rev())
        .pipe(gulp.dest('dist/static/js'));  // 写入 'dist/js'
});
/*=====================合并、压缩css==========================*/
gulp.task('concat', function(){
    gulp.src(['dist/static/css/**/*.css'])  //- 需要处理的css文件，放到一个字符串数组里
        //.pipe(concat('style.rar.css'))                            //- 合并后的文件名
        .pipe(minifyCss())                                      //- 压缩处理成一行
        //.pipe(rev())                                           //- 文件名加MD5后缀
        //.pipe(revAppend())                                            //- 文件名加MD5后缀
        .pipe(gulp.dest('dist/static/'))                               //- 输出文件本地
        //.pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
        //.pipe(gulp.dest('config'));                      //- 将 rev-manifest.json 保存到 rev 目录内
});
/*=====================打包、修改地址==========================*/
gulp.task('replace', function(){
    gulp.src(['config/*.json','dist/views/**/*'])
        .pipe(revCollector())    //- 执行文件内css名的替换
        //.pipe(replace('css/','./css/'))   //替换地址
        //.pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/views/'))
});

gulp.task('miniHtml', function() {
    return gulp.src('dist/views/*.hbs')
        .pipe(revAppend())
        .pipe(gulp.dest('dist/views/'));
});

//gulp.task('expressgulp', [ 'js','concat','replace']);

// 生成版本号清单
gulp.task('rev', function() {
    gulp.src(['dist/static/!(lib)/**/*.*'])
    .pipe(rev())
    .pipe(revFormat({
        prefix: '.', // 在版本号前增加字符
        suffix: '.cache', // 在版本号后增加字符
        lastExt: false
    }))
    .pipe(rev.manifest())
    .pipe(gulp.dest("config/"));
});
gulp.task('add-version',['rev'], function() {
    var manifest = gulp.src(["config/rev-manifest.json"]);
    function modifyUnreved(filename) {
        return filename;
    }
    function modifyReved(filename) {
        // filename是：admin.69cef10fff.cache.css的一个文件名
        // 在这里才发现刚才用gulp-rev-format的作用了吧？就是为了做正则匹配，
        if (filename.indexOf('.cache') > -1) {
            // 通过正则和relace得到版本号：69cef10fff
            const _version = filename.match(/\.[\w]*\.cache/)[0].replace(/(\.|cache)*/g,"");
            // 把版本号和gulp-rev-format生成的字符去掉，剩下的就是原文件名：admin.css
            const _filename = filename.replace(/\.[\w]*\.cache/,"");
            // 重新定义文件名和版本号：admin.css?v=69cef10fff
            filename = _filename + "?v=" + _version;
            console.log(filename);
            // 返回由gulp-rev-replace替换文件名
            return filename;
        }
        //console.log(filename);
        return filename;
    }
    gulp.src(['dist/views/**/*.hbs'])
        // 删除原来的版本
        .pipe(replace(/(\.[a-z]+)\?(v=)?[^\'\"\&]*/g,"$1"))
        .pipe(revReplace({
            manifest: manifest,
            modifyUnreved: modifyUnreved,
            modifyReved: modifyReved
        }))
        .pipe(gulp.dest('dist/views'));
});

gulp.task('build', function(done) {
    runSequence(
        ['clean'],
        ['copy'],
        ['js'],
        ['replace'],
        ['add-version'],
        done);
});
gulp.task('expressgulp', ['build']);

