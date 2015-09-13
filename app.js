
//Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');

//to parse the content we need to post
var bodyParser = require('body-parser');
var router = express();
//server part
// var restful = require('node-restful');
// var mongoose = restful.mongoose;
// //var mongoose =  require('mongoose');
// mongoose.connect('mongodb://localhost/restapi');

// console.log("READCHED HERE");

// router.get('/defects', function(req, res, next) {
//   Defect.find(function(err,docs){
//     docs.forEach(function(item){
//       console.log("Received successfully !!" + item._id);
//     })
//      // res.render('defects', { title: 'DefectList',defectsList:data,user:admin,staticData:json});
//   });
// });

var routes = require('./routes/index');
//var users = require('./routes/users');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.locals.pageTitle = "Defect Logger";
// will go through all the custom routes first
// and then go to public directory and override it
//app.use(app.router);

//browsers by default support only get and post..
//you have to use method override to use delete and put
//app.use(express.methodOverride());

//helps to retreive the files from public folder
app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

//APP.USE HELP WHOEVER HITS THIS PORT TO RUN THE FOLLOWING FUNCTIONS BY DEFAULT.

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
// app.post('/user', function(req,res){
// res.send("Submitted users name " + req.body.name);
// });


app.use('/', routes);
// app.get('/user/:username', function(req,res){
//   res.send('Welcome to '+ req.params.username + "'s Profile !");
// });

//HANDLING FILES 

// app.get('/file.txt',function(req,res){
//   res.send("Someone has  overridden me !! OMG !!");
// })

//join will get you the text to be rendered as html content

// app.get('/',function(req,res){
//   var msg = [
// "<h1>Hello</h1>",
// "<p>Great guys !!</p>",
// "<br>i am break !!</br>",
//   ].join('\n');
//   res.send(msg);
// });


/*app.get('/', function(req,res){
  res.send('Hello dood');
});
*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
