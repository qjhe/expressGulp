var request = require('request'),
    session = require('express-session');
//登录校验
exports.login = function (userName, pwd, callback) {
    var url = "http://www.mockhttp.cn/mock/getUser";
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var userInfo = eval('(' + body + ')');
            if (userName == userInfo.userName && pwd == userInfo.pwd) {
                callback&&callback(userInfo);
            }
        }
    });
}


