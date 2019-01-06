var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3({
    accessKeyId : '', 
    secretAccessKey : '', 
    useAccelerateEndpoint: true
  });


app.get('/get-presigned-url', function(req,res) {
  const signedUrlExpireSeconds = 60 * 60;
  const myBucket = 'arnold-file-bucket';
  const myKey = 'worldmap';
  const params = {
    Bucket: myBucket,
    Key: myKey, 
    Expires: signedUrlExpireSeconds, 
    ACL: 'public-read', 
    ContentType:'image/jpeg'};

  s3.getSignedUrl('putObject', params, function (err, url){
    console.log(url);
    if (err){
      console.log('Error getting presigned url from AWS S3');
      res.json({ success : false, message : 'Pre-Signed URL error', urls : 'none'});
    } else{
      console.log('Presigned URL:' , url);
      res.json({ success : true, message : 'AWS SDK S3 Pre-signed urls generated successfully.', urls : url});
    }
  });
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

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
