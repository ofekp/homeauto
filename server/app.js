var express = require('express');
var forceSSL = require('express-force-ssl');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');
var homeAutoRouter = require('./routes/homeAuto');

var app = express();

// since we need moment in pug
app.locals.moment = require('moment');

// set up MongoDB connection
var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var mongoDB = 'mongodb://dbuser:mydbdbmy@mongo:27017/db'  // `mongo` is the name of the container, it also functions as the IP address!
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(forceSSL);
//app.use(express.static(path.join(__dirname, 'public')));
// add React static files
const CLIENT_BUILD_PATH = path.join(__dirname, '../client/build');
//app.use(express.static(CLIENT_BUILD_PATH));

// api routes
app.use("/.well-known/acme-challenge", express.static("/webroots/" + process.env.DOMAIN + "/.well-known/acme-challenge"));

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' } ))
// app.use((req, res, next) => {
//   console.log("revoke token");
//   res.status(401);
//   res.set('Content-Type', 'application/json;charset=UTF-8');
//   res.send({"error":"user_not_found"});
// });
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);
app.use('/home-auto', homeAutoRouter);

// home assitant API
app.use(bodyParser.json());

// all remaining requests return the React app, so it can handle routing.
app.get('*', function(req, res) {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

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
