var express = require('express');
var router = express.Router();
//------------------------
// read project setting
//------------------------
var red_setting = require('../fs_address');
var device_config = red_setting.device_config;
var JSON_NAME = red_setting.JSON_NAME;

// save json file
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
router.post('/', function (req, res, next) {
    //check token
    if (req.customStatus !== 200)
        res.json(req.customError)
    else {
        req.body.ntp_address_value
        var exec = require('child_process').exec;
        var child;
        device_config.network.NTP = (req.body.ntp_address_value != null && req.body.ntp_address_value != '') ? req.body.ntp_address_value : '';
        write_json();

        child = exec("sudo ntpdate " + req.body.ntp_address_value, function (error, stdout, stderr) {
            if (error !== null) {
                res.json(
                    {
                        code: 400,
                        message: "fail: " + error,
                    }
                );
            }
            else {
                res.json(
                    {
                        code: 200,
                        message: "connect Connect NTP server success and date has been adjusted",
                    }
                );
            }
        });
    }
});

module.exports = router;
