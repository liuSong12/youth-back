var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const checkToken = require("./utils/checkToken.js")
const cors = require("cors")
const fs = require("fs")

let userapiRouter = require('./routes/api.js')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var manageRouter = require('./routes/manage')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var accessLogStream = fs.createWriteStream(path.resolve(__dirname,`./logs/expresslog/logs.txt`), {flags: 'a'});

logger.token('localDate',function getDate(req) {
  let date = new Date();
  return date.toLocaleString()
})
 
// 自定义format，其中包含自定义的token
logger.format('combined','[:localDate] :method :url :status');
 
// 使用自定义的format
app.use(logger('combined',{stream: accessLogStream}));



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors())
app.use(checkToken)

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api',allowAuthToken, userapiRouter);
app.use('/manage',allowAuthToken,manageRouter);

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


function allowAuthToken(req,res,next){
	res.setHeader("Access-Control-Expose-Headers","Authorization")
	next()
}

module.exports = app;
