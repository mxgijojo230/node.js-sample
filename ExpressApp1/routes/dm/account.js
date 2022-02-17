var express = require('express');
var router = express.Router();

//------------------------
// read project setting
//------------------------
var red_setting = require('../fs_address');
var device_config = red_setting.device_config;
var JSON_NAME = red_setting.JSON_NAME;

//------------------------
//encryption function
//------------------------
var bcrypt = require('bcryptjs');
//隨機產生加密碼
var salt = bcrypt.genSaltSync(10);


function write_json() {
    var fs = require('fs');
    var path = require('path');
    var data = JSON.stringify(device_config);
    fs.writeFileSync(path.join(__dirname, '../../' + JSON_NAME), data);
    console.log(data);

    var exec = require('child_process').exec;
    var child = exec('ls -l ' + path.join(__dirname, '../../' + JSON_NAME), function (error, stdout, stderr) {
        console.info('ls -l ' + path.join(__dirname, '../../' + JSON_NAME));
        console.log(stdout);
    });

}

/* GET users listing. */
router.put('/', function (req, res, next) {
    //check token
    if (req.customStatus !== 200)
        res.json(req.customError)
    else {
        if (req.body.user != "" && req.body.password != "") {
            console.log("user = " + req.body.user);
            device_config.account_encrypt = bcrypt.hashSync(req.body.user, salt);
            device_config.password_encrypt = bcrypt.hashSync(req.body.password, salt);
            device_config.account = req.body.user;
            device_config.passwd = req.body.password;
            write_json();
            res.json({
                "code": 200,
                "message": "change success"
            })
        }
    }
});


module.exports = router;
