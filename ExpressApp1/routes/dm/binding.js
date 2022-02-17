var express = require('express');
var router = express.Router();
//----------JWT--------------------------
var JWT = require('../jwt/JWT');


/* GET users listing. */
router.delete('/', function (req, res, next) {
    const client_token = req.headers.authorization;
    //check token
    if (req.customStatus !== 200)
        res.json(req.customError)
    else {
        if (JWT.delete(client_token))
            res.json(
                {
                    code: 200,
                    message: "Loginout",
                }
            );
        else
            res.json(
                {
                    code: 400,
                    message: "Loginout fail",
                }
            );
    }
});



module.exports = router;
