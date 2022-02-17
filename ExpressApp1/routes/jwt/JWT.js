var jwt = require('jsonwebtoken');  // JWT ñ�W�M����
var conf = require('./conf');
var del_token = [];

module.exports = {

    // ���� OAuth 2.0 �M JWT �� JSON �榡�O�P�T��
    createToken: function (req,  res, next) {

        // create payload
        var payload = {
            sub: conf.payload.sub,
            user: conf.payload.user,
            password: conf.payload.password
        };
        // ���� JWT
        var token = jwt.sign(payload, conf.secret, {
            algorithm: 'HS256',
            expiresIn: conf.increaseTime + 's'  // JWT ������ɶ� (��e UNIX �ɶ��W + �]�w���ɶ�)�C�����[�W�ɶ����A�_�h�w�]�� ms (�@��)
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
            const bearer = bearerHeader.split(' '); // �r�����
            const bearerToken = bearer[1]; // ���o JWT
            //---check if it is  logouted-----
            var decodeToken = jwt.decode(bearerToken, conf.secret);  //�ѱK
   
            if (del_token.indexOf(decodeToken.exp) == -1) {
                jwt.verify(bearerToken, conf.secret, function (err, decoded) {
                    if (err) {
                        req.customStatus = 400;
                        switch (err.name) {
                            // JWT �L��
                            case 'TokenExpiredError':
                                req.customError = { id: req.customStatus, message: 'token expired' };
                                console.log("token ded");
                                break;
                            // JWT �L��
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
        const bearer = bearerHeader.split(' '); // �r�����
        const bearerToken = bearer[1]; // ���o JWT

        var decodeToken = jwt.decode(bearerToken, conf.secret);  //�ѱK
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
