var express = require('express');
var router = express.Router();
//------------------------
// read project setting
//------------------------
var red_setting = require('../fs_address');
var device_config = red_setting.device_config;
var camera_status=red_setting.camera_status;
var get_serial_number = red_setting.get_serial_number;
var get_cam_serial_number = red_setting.get_cam_serial_number;
var get_MAC = red_setting.get_MAC;
var camera_version = red_setting.camera_version;
/* GET users listing. */
router.get('/', function (req, res, next) {
    //check token
    if (req.customStatus !== 200)
        res.json(req.customError)
    else {
        var cam_status=''
        if (camera_status=="true")
            cam_status = "Normal";
        else
            cam_status = "No detect";
        res.json({
            code: 200,
            message: "Get success",
            "device_name": device_config.device_name,
            "Serial_Number": get_serial_number,
            "version_os": device_config.version.os,
            "version_cam": camera_version,
            "MAC_address": get_MAC,
	    "Cam_Serial_Number": get_cam_serial_number,
            "status": cam_status
        })

    }


});


module.exports = router;
