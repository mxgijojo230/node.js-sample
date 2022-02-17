var express = require('express');
var router = express.Router();

//----------------------------
//set to read json address 
//----------------------------
var PROJECT_SELECT = 1; //select address 1:for IS4 ,2:for KS2
var PROJECT_MODEL = 0; //select address 0:for local debug,1:for release project

switch (PROJECT_SELECT) {
    case 1:
        var JSON_NAME = "ae400config.json"; // ae400config.json: for IS4 
        break;
    case 2:
        var JSON_NAME = "tinyconfig.json"; // tinyconfig.json :for KS2 
        break;
}

var path = require('path');
var fs = require('fs');
var rawdata = fs.readFileSync(path.join(__dirname, '../' + JSON_NAME));
var rawOS = fs.readFileSync(path.join(__dirname, '../../' + JSON_NAME));//for reading OS version
var device_config = JSON.parse(rawdata);
var OS_config = JSON.parse(rawOS);
var device_config = JSON.parse(rawdata);

//-------------------
//Get camera version
//-------------------
function get_cam_Div(){
    const DB_exec = require('child_process').execSync;
    const div_lsusb="lsusb|grep 'Intel Corp.' | sed 's/^.*Device //g' | sed 's/ *:.*$//g'";
    if(Number(DB_exec(div_lsusb))!="")
    return "true";
}
function get_cam_Bus(){
    const DB_exec = require('child_process').execSync;
    const bus_lsusb="lsusb|grep 'Intel Corp.'|sed 's/^.*Bus //g'|sed 's/ *Device.*$//g'";
    return Number(DB_exec(bus_lsusb));
}
function get_cam_version(){
    const exec_sync = require('child_process').execSync;
    return exec_sync("sudo cat /tmp/foo3");	            
}
//-------------------
//Get MAC address
//-------------------
function get_MAC() {
    const exec_sync = require('child_process').execSync;
    return exec_sync('sudo cat /tmp/foo1');
}
//-------------------
//Get Cam serial Number
//-------------------
function get_cam_serial_number() {
    const exec_sync = require('child_process').execSync;
    return exec_sync("sudo cat /tmp/foo2");
}

//-------------------
//Get serial Number
//-------------------
function get_serial_number() {
    const exec_sync = require('child_process').execSync;
    return exec_sync("cat /proc/cmdline |sed 's/^.*serialno=//g'|sed 's/ *rw.*$//g'");
}

module.exports = {
    device_config: device_config,
    PROJECT_SELECT: PROJECT_SELECT,
    PROJECT_MODEL: PROJECT_MODEL,
    OS_config: OS_config,
    JSON_NAME: JSON_NAME,
    //get_MAC: String(get_MAC()),
    //get_serial_number: String(get_serial_number()),
    //get_cam_serial_number:String(get_cam_serial_number()),
    //camera_version:String(get_cam_version()),
    //camera_status:get_cam_Div(),
};
