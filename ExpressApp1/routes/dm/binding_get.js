var express = require('express');
var router = express.Router();
//---------------
//define
//---------------
var JWT = require('../jwt/JWT');
var fs = require('fs');
var path = require('path');
//------------------------
// read project setting
//------------------------
var red_setting = require('../fs_address');
var device_config = red_setting.device_config;
var OS_config = red_setting.OS_config;
var JSON_NAME = red_setting.JSON_NAME;
//create salt
var bcrypt = require('bcryptjs');

//隨機產生加密碼
var salt = bcrypt.genSaltSync(10);

//--------------------------
//Write data to jason file
//--------------------------
function write_jason() {
    var fs = require('fs');
    var data = JSON.stringify(device_config);
    fs.writeFileSync(path.join(__dirname, '../../' + JSON_NAME), data);
    console.log(data);

    var exec = require('child_process').exec;
    var child = exec('ls -l ' + path.join(__dirname, '../../' + JSON_NAME), function (error, stdout, stderr) {
        console.info('ls -l ' + path.join(__dirname, '../../' + JSON_NAME));
        console.log(stdout);
    });
}

//--------------------------
//Write OS to jason file
//--------------------------
function write_OS_jason() {
    var fs = require('fs');
    var data = JSON.stringify(OS_config);
    fs.writeFileSync(path.join(__dirname, '../../' + JSON_NAME), data);
    console.log(data);

    var exec = require('child_process').exec;
    var child = exec('ls -l ' + path.join(__dirname, '../../' + JSON_NAME), function (error, stdout, stderr) {
        console.info('ls -l ' + path.join(__dirname, '../../' + JSON_NAME));
        console.log(stdout);
    });

}

//----------------------
//Check OS version
//----------------------
function check_OS_version() {
    old_os = device_config.version.os.split("v");
    js_os = OS_config.version.os.split("v");
    if (parseFloat(old_os[1], 10) < parseFloat(js_os[1], 10)) {
        device_config.version.os = OS_config.version.os;
        device_config.account_encrypt = bcrypt.hashSync(device_config.account, salt);
        device_config.passwd_encrypt = bcrypt.hashSync(device_config.passwd, salt);
        write_jason();
    }
    return;
}


function compare_account(input_account) {
    var isOk = false;
    device_config.account_encrypt = bcrypt.hashSync(device_config.account, salt);

    isOk = bcrypt.compareSync(input_account, device_config.account_encrypt);
    return isOk;
}
function compare_password(input_password) {
    var isOk = false;
    device_config.passwd_encrypt = bcrypt.hashSync(device_config.passwd, salt);

    isOk = bcrypt.compareSync(input_password, device_config.passwd_encrypt);

    return isOk;
}


/* GET users listing. */
router.post('/', function (req, res, next) {
    console.log("user: " + req.body.user + " password:" + req.body.password);
    var get_act = false;
    var get_pad = false;
    //check OS version 
    check_OS_version();
    get_pad = compare_password(req.body.password);
    get_act = compare_account(req.body.user);
    if (get_pad == true && get_act == true) {
      /*  var account = [{
            user: req.body.user ,
            password: req.body.password,
        }];
        */
        var token = JWT.createToken();
        res.json(
            {
                code: 200,
                message: "login success",
                token: token,
            }
        );
    }
    else {
        res.send("login fail!");
    }
});



module.exports = router;
