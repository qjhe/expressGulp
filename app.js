//demo.js 文件
var express = require('express'),
    hbs = require('hbs'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    fs = require('fs'),
    http = require('http'),
    app = express();

app.use(cookieParser());
app.use(session({
    secret: '123456',
    cookie: {maxAge: 60 * 1000 * 30},
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(__dirname + '/src/static'));

app.get('/hello', function (req, res) {
    res.send('HELLO');
});

var user = require(__dirname + '/src/server/user.js');
app.get('/login', function (req, res) {
    if (req.session.sign) {//检查用户是否登录
        res.send('welecome <strong>' + req.session.name + '</strong>, 欢迎你再次登录');
    } else {
        user.login('王冲', '111qqq',function(userInfo){
            req.session.sign = true;
            req.session.name = userInfo.userName;
            res.send('欢迎登录,' + req.session.name);
        });
    }
});

//app.get('/index', function (req, res) {
//    console.log(__dirname);
//    res.sendFile(__dirname + '/src/views/' + 'index.html');
//});

app.get('/process_get', function (req, res) {
    var response = {
        firstName: req.query.firstName,
        lastName: req.query.lastName
    }
    console.log(response);
    res.end(JSON.stringify(response));
});

hbs.registerPartials(__dirname + '/src/views/partials');
app.set('view engine', 'hbs');
app.set('views', __dirname + '/src/views/');

app.get('/news', function (req, res) {
    var userInfo = {
        userName: req.session.name
    }
    res.render('index', {title: 'hbs news demo', author: 'qujh',userInfo:userInfo});
});


app.get('/about/ygt', function (req, res) {
    res.render('about/test', {title: 'hbs ygt demo', author: 'qujh'});
});

app.get('/about/about', function (req, res) {
    res.render('about/about', {title: 'hbs about demos', author: 'qujh'});
});

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});