var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    //check token
    if (req.customStatus !== 200)
        res.json(req.customError)
    else {
        const exec_restart = require('child_process').execSync;
        res.json(
            {
                code: 200,
                message: "System restart",
            }
        )
        exec_restart('reboot');
    }
});


module.exports = router;
