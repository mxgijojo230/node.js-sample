//----------------------------
//define
//----------------------------
var express = require('express');
var router = express.Router();
var verified = false;
var fs = require('fs');
var path = require('path');
//------------------------
// read project setting
//------------------------
var red_setting = require('./fs_address');
var device_config = red_setting.device_config;
var OS_config = red_setting.OS_config;
var PROJECT_SELECT = red_setting.PROJECT_SELECT;
var PROJECT_MODEL = red_setting.PROJECT_MODEL;
var JSON_NAME = red_setting.JSON_NAME;
var camera_status = red_setting.camera_status;
var camera_version = red_setting.camera_version;
var get_serial_number = red_setting.get_serial_number;
var get_cam_serial_number = red_setting.get_cam_serial_number;
var get_MAC = red_setting.get_MAC;
//------------------------
//encryption function
//------------------------
var bcrypt = require('bcryptjs');
//Generated randomized encryption
var salt = bcrypt.genSaltSync(10);
//------------------------
//upload function define
//------------------------
var upload_name=""
var multer = require('multer');
if (PROJECT_MODEL == 1) {
    var uploadFolder = '/home/user/update/';
    if (PROJECT_SELECT==2) //for KS2
        var fw_uploadFolder = '/home/user/RS2_FW_UPGRADE/';
    else
        var fw_uploadFolder = '/home/user/FW_UPGRADE/';
}
else if (PROJECT_MODEL == 0) {
    var uploadFolder = './upload/';//setup uploaded folder
    var fw_uploadFolder = './upload/';
}
var upload_status = '';
var fw_upload_status = '';
var upload_interrupt = false;
var fw_upload_interrupt = false;
var createFolder = function (folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};
createFolder(uploadFolder); //create upload folder
console.log(device_config);
//----------------------------
// create SSL certification
//----------------------------
function SSL_cre(new_IP){
    const SSL_exec = require('child_process').execSync;
    const ssl_cong ="sed -i 's/^.*IP.1.*$/IP.1 = "+new_IP+"/' ssl.conf"
    //const ssl_cong="sed -i 's/"+device_config.network.ip_address+"/"+new_IP+"/g' ssl.conf";
    SSL_exec(ssl_cong);
    const ssl_create="openssl req -x509 -new -nodes -sha256 -utf8 -days 3650 -newkey rsa:2048 -keyout server.key -out server.crt -config ssl.conf"
    SSL_exec(ssl_create); 
     return;   
}
//----------------------------
//delay function
//----------------------------
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
//--------------------------
//Write data to jason file
//--------------------------
function write_jason() {
    var fs = require('fs');
    var data = JSON.stringify(device_config);
    fs.writeFileSync(path.join(__dirname, '../' + JSON_NAME), data);
    console.log(data);

    var exec = require('child_process').exec;
    var child = exec('ls -l ' + path.join(__dirname, '../' + JSON_NAME), function (error, stdout, stderr) {
        console.info('ls -l ' + path.join(__dirname, '../' + JSON_NAME));
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
//--------------------
//Get date function
//--------------------
function get_date(){
    var date = new Date().toLocaleString();
    return date;
}


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', function (req, res) {
    var get_act = false;
    var get_pad = false;
    console.log(req.body.ck_account);
    console.log(req.body.ck_password);
    //----check OS version---
    check_OS_version();
    get_pad=compare_password(req.body.ck_password);
    get_act = compare_account(req.body.ck_account);


    if (get_pad == true && get_act == true) {
        verified = true;

    }
    else { verified = false; }


  if (verified==true)
  {
      res.render('ip', {
          dhcp_on_value: device_config.network.dhcp_on,
          ip_address_value: device_config.network.ip_address,
          mask_address: device_config.network.subnet_mask,
          gateway_address: device_config.network.gateway,
          dns_address: device_config.network.dns,
          visited: "ip"
      });
  } else {
    res.render('login', { login_status: 'fail' });
  }
});
//----------------------------
//System information
//----------------------------
router.get('/config', function (req, res, next) {
  if (upload_interrupt) {
      const exec_sync = require('child_process').execSync;
      var rm_imglocat = "rm -rf " + uploadFolder + upload_name;
      var yourscript = exec_sync(rm_imglocat);
  }  
  if (verified == false)
    res.render('login');
  else
  {    
      res.render('config', {
          camera_status: camera_status, 
          device_name: device_config.device_name,
          version_os: OS_config.version.os,
          version_cam: camera_version,
          serial_number: get_serial_number,
	  cam_serial_number: get_cam_serial_number,
          mac_address: get_MAC,
          host_img: read_imgfile(),
          visited: "config",
      });
   }
});

router.post('/config', function(req, res) {
    if(req.body.config_btn == "save"){
	    console.log(req.body.deviceName);
	    device_config.device_name = (req.body.deviceName != null && req.body.deviceName != '') ? req.body.deviceName : '';
	    write_jason();
	    sleep(1000);
	    console.log("show "+req.body.config_btn);
        res.render('config', {
        camera_status: camera_status,
	config_status: 'success',
	device_name: device_config.device_name,
	version_os: OS_config.version.os,
        version_cam: camera_version,
        serial_number: get_serial_number,
        cam_serial_number: get_cam_serial_number,
        mac_address: get_MAC,
        host_img: read_imgfile(),
            visited: "config"
	    });
    }

//load default setting
    else if(req.body.config_btn == "load_default"){
	    const exec_load_default = require('child_process').execSync;
        res.render('login', { login_status: 'default' });
        if(verified==true)
        {
	    verified = false;
            exec_load_default('sudo cp -rf ./default_SSL/server.crt ./');
            exec_load_default('sudo cp -rf ./default_SSL/server.key ./');
            exec_load_default('sudo cp -rf ./default_SSL/ssl.conf ./');
            if (PROJECT_SELECT==2) //for KS2
                exec_load_default('sudo sh ../scripts/restore_default.sh');
            else
	            exec_load_default('sudo sh ../reset.sh');
	}
    }

//Restart and login out
    else if(req.body.config_btn == "restart"){
	res.render('login', { login_status:'restart'});
        if(verified==true)
        {
	    const exec_loginout = require('child_process').execSync;
	    verified = false;
	    exec_loginout('reboot');
	}
    }
});



//----------------------
//IP setting
//----------------------
router.get('/ip', function (req, res) {
    if (verified == false)
        res.render('login');
    else
        res.render('ip', {
            dhcp_on_value: device_config.network.dhcp_on,
            ip_address_value: device_config.network.ip_address,
            mask_address: device_config.network.subnet_mask,
            gateway_address: device_config.network.gateway,
            dns_address: device_config.network.dns,
            visited: "ip"
        });
});
router.post('/ip', function (req, res) {
    if (verified == false)
        res.render('login');
    else {
        //check ip have been changed
        if (device_config.network.ip_address != req.body.inputIpAddress && req.body.inputIpAddress != null && req.body.inputIpAddress != ''){
	  SSL_cre(req.body.inputIpAddress);
	}
        device_config.network.dhcp_on = (req.body.inputDhcpOn != null && req.body.inputDhcpOn == 'dhcp_on') ? true : false;
        device_config.network.ip_address = (req.body.inputIpAddress != null && req.body.inputIpAddress != '') ? req.body.inputIpAddress : device_config.network.ip_address;
        device_config.network.subnet_mask = (req.body.inputMaskAddress != null && req.body.inputMaskAddress != '') ? req.body.inputMaskAddress : device_config.network.subnet_mask;
        device_config.network.gateway = (req.body.inputGatewayAddress != null && req.body.inputGatewayAddress != '') ? req.body.inputGatewayAddress : device_config.network.gateway;
        device_config.network.dns = (req.body.inputDnsAddress != null && req.body.inputDnsAddress != '') ? req.body.inputDnsAddress : device_config.network.dns;
        var fs_del = require('fs');
        fs_del.unlink('/etc/network/interfaces', function () {
        });
        var fs_net = require('fs');
        fs_net.writeFileSync('/etc/network/interfaces', '# interfaces(5) file used by ifup(8) and ifdown(8)\n');
        fs_net.appendFileSync('/etc/network/interfaces', '# Include files from /etc/network/interfaces.d:\n');
        fs_net.appendFileSync('/etc/network/interfaces', 'auto eth0\n');
        if (device_config.network.dhcp_on == true) {
            fs_net.appendFileSync('/etc/network/interfaces', 'iface eth0 inet dhcp \n');
        }
        else {
            fs_net.appendFileSync('/etc/network/interfaces', 'iface eth0 inet static \n');
            fs_net.appendFileSync('/etc/network/interfaces', 'address ' + device_config.network.ip_address + '\n');
            fs_net.appendFileSync('/etc/network/interfaces', 'netmask ' + device_config.network.subnet_mask + '\n');
            fs_net.appendFileSync('/etc/network/interfaces', 'gateway ' + device_config.network.gateway + '\n');
            if (device_config.network.dns != '') {
                fs_net.appendFileSync('/etc/network/interfaces', 'dns-nameservers ' + device_config.network.dns + '\n');
            }
        }

        fs_net.appendFileSync('/etc/network/interfaces', 'source-directory /etc/network/interfaces.d\n');
        write_jason();

        const exec_sync = require('child_process').exec;
        var yourscript = exec_sync('sync',
            (error, stdout, stderr) => {
                //console.log(`${stdout}`);
                //console.log(`${stderr}`);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            })
        sleep(1000);
        /*  restart function */
	res.render('login', { login_status: 'success' });
        if(verified==true)
        {
        	verified = false;
		const exec_reboot = require('child_process').exec;   
		var yourscript = exec_reboot('reboot',
		    (error, stdout, stderr) => {
		        //console.log(`${stdout}`);
		        //console.log(`${stderr}`);
		        if (error !== null) {
		            console.log(`exec error: ${error}`);
		        }
		    });  
	}
    }
});


//---------------------
// NTP button function
//---------------------
router.get('/NTP', function (req, res) {
    if (verified == false)
        res.render('login');
    else
        res.render('ntp', {
            NTP_address: device_config.network.NTP,
            input_time: get_date(),
            visited: "ntp"
        });
});

router.post('/NTP', function(req, res) {
	var exec = require('child_process').exec;
    var child;

    console.log(req.body.inputNTPAddress); 
    device_config.network.NTP = (req.body.inputNTPAddress != null && req.body.inputNTPAddress != '') ? req.body.inputNTPAddress : '';
    write_jason();
    sleep(1000);
	child = exec("sudo ntpdate "+req.body.inputNTPAddress, function (error, stdout, stderr) {
	  if (error !== null) {
	    res.render('ntp', { 
			NTP_address: req.body.inputNTPAddress,
			input_time: get_date(),
			NTP_status: 'error',
            NTP_error: "fail: " + error,
            visited: "ntp"
        });
	  }
	  else{
        res.render('ntp', { 
			NTP_address: req.body.inputNTPAddress,
			input_time: get_date(),
            NTP_status: 'success',
            visited: "ntp"
        });
	  }
	});
});
//-------NTP end----------

//-------------------------
//Upload img
//-------------------------
if (PROJECT_SELECT==2) //for KS2
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadFolder);//Upload file in 'uploadFolder' folder
        },
        filename: function (req, file, cb) {//Setup file name
            upload_name = file.originalname;
            //clear document file
   	        clean_file = require('child_process').exec;
            clean_file("rm -rf " + uploadFolder + "*");
            sleep(1000);
            cb(null, upload_name);
            upload_interrupt = true;
        }
    })
else if (PROJECT_SELECT==1) //for IS4
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadFolder);//Upload file in 'uploadFolder' folder
        },
        filename: function (req, file, cb) {//Setup file name
            upload_name = "update.img";
            //clear document file
            clean_file = require('child_process').exec;
            clean_file("rm -f " + uploadFolder + upload_name);
            sleep(1000);
            cb(null, upload_name);
            upload_interrupt = true;
        }
    })

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
            cb(null, true);
            upload_status = 'success';
        }
 });
function read_imgfile(){
    //read /home/user/update/update.img file
    const exec_file = require('child_process').execSync;
    var host_img = exec_file("ls -s " + uploadFolder+ " | head -n 1  | sed 's/^.* //g'");
    return host_img
}
router.get('/upload', function (req, res) {
    upload_status = '';
    //Remove the file which upload failed
    if (upload_interrupt) {
        const exec_sync = require('child_process').execSync;
        var rm_imglocat = "sudo rm -rf " + uploadFolder+upload_name;
        var yourscript = exec_sync(rm_imglocat)
    }

    if (verified == false)
        res.render('login');
    else
        res.render('upload', {
            host_img: read_imgfile(),
            visited: "upload"
        });
});

router.post('/upload', upload.any(), function (req, res) {
    if (upload_status == 'success') {
        upload_interrupt = false;
        const exec_sync = require('child_process').exec;
        var yourscript = exec_sync('sync',
            (error, stdout, stderr) => {
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            })
    }    
    res.render('upload', {
        upload_status: upload_status,
        host_img: read_imgfile(),
        visited: "upload"
    });

});
router.post('/update_img', function (req, res) {
    if (PROJECT_SELECT==2) {//for KS2
        /*  run upgrade script */
        const exec_update = require('child_process').execSync;
        var update_bin="";
        var update_bash = "sudo sh /home/lips/scripts/fw_upgrade.sh";
        update_bin = exec_update(update_bash);
        if(update_bin!="")
        {
		verified = false;
   	        res.render('login', { login_status: 'update' });
        }
    }
    else {
	res.render('login', { login_status: 'update' });
        /*  restart function */
        const exec_reboot = require('child_process').exec;
        if(verified==true)
        {
		verified = false;
		console.log("restart");
		var yourscript = exec_reboot('reboot',
		    (error, stdout, stderr) => {
		        //console.log(`${stdout}`);
		        //console.log(`${stderr}`);
		        if (error !== null) {
		            console.log(`exec error: ${error}`);
		        }
		    });
	}

    }

});
//-------------------------------
//  upload img on config page
//-------------------------------
router.post('/con_upload', upload.any(), function (req, res) {
    if (upload_status == 'success') {
        upload_interrupt = false;
        if (PROJECT_SELECT==2) { //for KS2
            /*  decompression function */
            const exec_decomp = require('child_process').execSync;
            var decomp_bash = "sudo tar -C "+uploadFolder+ " -zxvf " + uploadFolder+upload_name;
            var yourscript1 = exec_decomp(decomp_bash);
        }
        const exec_sync = require('child_process').exec;
        var yourscript = exec_sync('sync',
            (error, stdout, stderr) => {
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            })
    }
    res.render('config', {
        camera_status: camera_status,
        device_name: device_config.device_name,
        version_os: OS_config.version.os,
        upload_status: upload_status,
        host_img: read_imgfile(),
        version_cam: camera_version,
        serial_number: get_serial_number,
	cam_serial_number: get_cam_serial_number,
        mac_address: get_MAC,
        visited: "config"
    });

});

//-------------------------
//Account setting
//-------------------------
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


router.get('/account', function (req, res) {
    if (verified == false)
        res.render('login');
    else
        res.render('account', {
            visited: "account"
        });
});

router.post('/account', function (req, res) {
    var new_account = req.body.input_new_account;
    var new_passwrod = req.body.input_new_password;
    var new_ck_passwrod = req.body.input_ck_password;
    if (new_passwrod != req.body.input_ck_password && new_ck_passwrod!="")
        res.render('account', {
            input_status: 'not_match',
            visited: "account"
        });
    if (new_account != "" && new_passwrod != "" && new_ck_passwrod != "") {
        device_config.account = new_account;
        device_config.passwd = new_passwrod;
        device_config.account_encrypt = bcrypt.hashSync(new_account, salt);
        device_config.passwd_encrypt = bcrypt.hashSync(new_passwrod, salt);

        write_jason();
        sleep(1000);
        verified == false;
        res.render('login', { login_status: 'success' });
    }
    else
        res.render('account', {
            input_status: 'fail',
            visited: "account"
        });

});


//----------------------
//update FW
//----------------------

var FW_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, fw_uploadFolder);//Upload file in 'fw_uploadFolder' folder
    },
    filename: function (req, file, cb) {//Setup file name
        cb(null, "firmware.bin");
        fw_upload_interrupt = true;
    }
})

var fw_upload = multer({
    storage: FW_storage,
    fileFilter: function (req, file, cb) {
        //limit file format
        if (file.originalname.match(/\.(bin)$/)) {
            cb(null, true);
            fw_upload_status = 'success'
        } else {
            cb(null, false);
            fw_upload_status = 'error'
        }
    }
});
function read_binfile() {
    //Read /home/user/FW_UPGRADE/firmware.bin file
    const exec_file = require('child_process').execSync;
    var host_bin = exec_file("ls -s " + fw_uploadFolder+"firmware.bin | sed 's/ * .*$//g'");
    return host_bin
}


router.get('/fw', function (req, res) {

    fw_upload_status = '';
    var host_bin = '';
    //Remove the file which upload failed
    if (fw_upload_interrupt) {
        const exec_sync = require('child_process').execSync;
        var rm_imglocat = "sudo rm -rf " + fw_uploadFolder + "firmware.bin";
        var yourscript = exec_sync(rm_imglocat);
    }
    if (verified == false)
        res.render('login');
    else
        res.render('fw', {
            camera_detecte: get_cam_version(),
            upload_interrupt: fw_upload_interrupt,
            host_bin: read_binfile(),
            version_cam: device_config.version.cam,
            visited: "fw"
        });
});


router.post('/fw_upload', fw_upload.any(), function (req, res) {
    if (fw_upload_status == 'success') {
        fw_upload_interrupt = false;
        const exec_sync = require('child_process').exec;
        var yourscript = exec_sync('sync',
            (error, stdout, stderr) => {
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            })
    }
    res.render('fw', {
        camera_detecte: get_cam_version(),
        upload_status: fw_upload_status,
        host_bin: read_binfile(),
        version_cam: device_config.version.cam,
        visited: "fw"
    });
});


router.post('/update_fw', function (req, res) {
    sleep(1000);
    const exec_update = require('child_process').execSync;
    var update_bin="";
    var cam_locat = "sudo /bin/intel-realsense-dfu -b "+get_cam_Bus()+" -d "+get_cam_Div()+" -f -i " + fw_uploadFolder + "firmware.bin";
    var update_bin = exec_update(cam_locat);
    
    if(update_bin!="")
    {
       verified = false;
       res.render('login', { login_status: 'fw_update' });
    }
    /*
    exec_update('reboot',
        (error, stdout, stderr) => {

            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
        */
});
//------------------------------  
//  Download SSL certification
//------------------------------
router.post('/SSL', function (req, res) {
  var file = path.join(__dirname, '../server.crt')
  res.download(file);
});


module.exports = router;
