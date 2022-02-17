var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var configRouter = require('./routes/config');
var cors = require('cors');
//------------------------------------
//web api routes define
//------------------------------------
var ping = require('./routes/dm/ping.js');
var binding_get = require('./routes/dm/binding_get');
var binding = require('./routes/dm/binding');
var info = require('./routes/dm/info');
var account = require('./routes/dm/account');
var restart = require('./routes/dm/restart');
var ip = require('./routes/nm/ip');
var ntp = require('./routes/tm/ntp');
//---------------------------------------
//       JWT function route
//---------------------------------------
var JWT = require('./routes/jwt/JWT.js');
var app = express();

//---------------------------------------
//           HTTPS
//---------------------------------------
var https = require('https');
var fs = require('fs');
var options = {
    key:  fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
//---------------------------------------
//  Access head 
//---------------------------------------

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    next();
});
// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', configRouter);
//------------------------
//      Web API
//------------------------
app.use('/ae400/dm/binding', binding_get);
app.use('/ae400/dm/ping', ping);
//below router need token valify
app.use(JWT.validate);
app.use('/ae400/dm/binding', binding);
app.use('/ae400/dm/info', info);
app.use('/ae400/dm/account', account);
app.use('/ae400/dm/restart', restart);
app.use('/ae400/nm/ip', ip);
app.use('/ae400/tm/ntp', ntp);
//Https entry point
https.createServer(options, app)
     .listen(443,function() { console.log("HTTPS sever started"); }
);



app.listen(80, function() {
  console.log('Listening on port 80');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
