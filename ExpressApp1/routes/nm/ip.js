var express = require('express');
var router = express.Router();
//------------------------
// read project setting
//------------------------
var red_setting = require('../fs_address');
var device_config = red_setting.device_config;
var JSON_NAME = red_setting.JSON_NAME;

//----------------------------
// create SSL certification
//----------------------------
function SSL_cre(new_IP) {
    const SSL_exec = require('child_process').execSync;
    const ssl_cong = "sed -i 's/^.*IP.1.*$/IP.1 = " + new_IP + "/' ssl.conf"
    //const ssl_cong="sed -i 's/"+device_config.network.ip_address+"/"+new_IP+"/g' ssl.conf";
    SSL_exec(ssl_cong);
    const ssl_create = "openssl req -x509 -new -nodes -sha256 -utf8 -days 3650 -newkey rsa:2048 -keyout server.key -out server.crt -config ssl.conf"
    SSL_exec(ssl_create);
    return;
}


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

function checkdch() {
    if (device_config.network.dhcp_on == false)
        return 0;
    else if (device_config.network.dhcp_on == true)
        return 1;
}

function chnage_ip() {
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
        if (device_config.network.dns > 0) {
            fs_net.appendFileSync('/etc/network/interfaces', 'nameserver ' + device_config.network.dns + '\n');
        }
    }

    fs_net.appendFileSync('/etc/network/interfaces', 'source-directory /etc/network/interfaces.d\n');

}



/* GET users listing. */
router.get('/', function (req, res, next) {
    //check token
    if (req.customStatus !== 200)
        res.json(req.customError)
    else {
        res.json(
            {
                code: 200,
                message: "Get ip setting",
                dhcp_on_value: checkdch(),
                ip_address_value: device_config.network.ip_address,
                mask_address: device_config.network.subnet_mask,
                gateway_address: device_config.network.gateway,
                dns_address: device_config.network.dns
            }
        )
    }
});

router.put('/', function (req, res, next) {
    //check token
    if (req.customStatus !== 200)
        res.json(req.customError)
    else {
        //check ip have been changed
        if (device_config.network.ip_address != req.body.ip_address_value && req.body.ip_address_value != null && req.body.ip_address_value != '') {
            SSL_cre(req.body.ip_address_value);
        }
        device_config.network.dhcp_on = (req.body.inputDhcpOn != null && req.body.inputDhcpOn == 'dhcp_on') ? true : false;
        device_config.network.ip_address = (req.body.ip_address_value != null && req.body.ip_address_value != '') ? req.body.inputIpAddress : '';
        device_config.network.subnet_mask = (req.body.inputMaskAddress != null && req.body.inputMaskAddress != '') ? req.body.inputMaskAddress : '';
        device_config.network.gateway = (req.body.inputGatewayAddress != null && req.body.inputGatewayAddress != '') ? req.body.inputGatewayAddress : '';
        device_config.network.dns = (req.body.inputDnsAddress != null && req.body.inputDnsAddress != '') ? req.body.inputDnsAddress : '';

        device_config.network.ip_address = req.body.ip_address_value;
        device_config.network.subnet_mask = req.body.mask_address;
        device_config.network.gateway = req.body.gateway_address;
        device_config.network.dns = req.body.dns_address;
        if (req.body.dhcp_on_value == 0)
            device_config.network.dhcp_on = false;
        else if (req.body.dhcp_on_value == 1)
            device_config.network.dhcp_on = true;
        chnage_ip();
        write_json();
        //Sync save data
        const exec_sync = require('child_process').exec;
        var yourscript = exec_sync('sync',
            (error, stdout, stderr) => {
                //console.log(`${stdout}`);
                //console.log(`${stderr}`);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            })


        res.json(
            {
                code: 200,
                message: "change ip setting success",
            }
        )
    }
});

module.exports = router;
