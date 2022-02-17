var jwt = require('jsonwebtoken');  // JWT 簽名和驗證
var conf = require('./conf');
var del_token = [];

module.exports = {

    // 產生 OAuth 2.0 和 JWT 的 JSON 格式令牌訊息
    createToken: function (req,  res, next) {

        // create payload
        var payload = {
            sub: conf.payload.sub,
            user: conf.payload.user,
            password: conf.payload.password
        };
        // 產生 JWT
        var token = jwt.sign(payload, conf.secret, {
            algorithm: 'HS256',
            expiresIn: conf.increaseTime + 's'  // JWT 的到期時間 (當前 UNIX 時間戳 + 設定的時間)。必須加上時間單位，否則預設為 ms (毫秒)
        })
        console.log("JWT token :" + token);
        return token ;

    },
    validate: function (req, res, next) {
        const bearerHeader = req.headers.authorization;

        if (!bearerHeader) {
            req.customStatus = 401;
            req.customError = { id: req.customStatus, message: 'no input token' };
        }   
        else if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' '); // 字串切割
            const bearerToken = bearer[1]; // 取得 JWT
            //---check if it is  logouted-----
            var decodeToken = jwt.decode(bearerToken, conf.secret);  //解密
   
            if (del_token.indexOf(decodeToken.exp) == -1) {
                jwt.verify(bearerToken, conf.secret, function (err, decoded) {
                    if (err) {
                        req.customStatus = 400;
                        switch (err.name) {
                            // JWT 過期
                            case 'TokenExpiredError':
                                req.customError = { id: req.customStatus, message: 'token expired' };
                                console.log("token ded");
                                break;
                            // JWT 無效
                            case 'JsonWebTokenError':
                                req.customError = { id: req.customStatus, message: 'token invalid' };
                                console.log("token file");
                                break;
                        }
                    } else {
                        console.log("Valify success");
                        req.customError1 = {
                            id: 7,
                            name: "The Bluest eye",
                            author: "Toni Morrison",
                        }
                        req.customStatus = 200;
                    }
                });
            }
            else {
               req.customError = { id: 400, message: 'token invalid' };
               console.log("token file");
            }
        }
        next();
    },

    delete: function (data) {
        const bearerHeader = data;
        const bearer = bearerHeader.split(' '); // 字串切割
        const bearerToken = bearer[1]; // 取得 JWT

        var decodeToken = jwt.decode(bearerToken, conf.secret);  //解密
        // check token was not overlapping.
        if (del_token.indexOf(decodeToken.exp) == -1)
            del_token.push(decodeToken.exp);
        // deletion has expired token.
        del_token.reverse();
        if (del_token.findIndex(x => x < decodeToken.iat) != -1) {
            del_token.splice(del_token.findIndex(x => x < decodeToken.iat ))
        }  
        del_token.reverse();

        return 1;
    },

};
