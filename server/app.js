var express = require('express');
var forceSSL = require('express-force-ssl');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var device = require('express-device');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');
var homeKeeperRouter = require('./routes/homeKeeper');
var loginRouter = require('./routes/login');

var app = express();
var mongoDB = 'mongodb://dbuser:mydbdbmy@mongo:27017/db'  // `mongo` is the name of the container, it also functions as the IP address!

// *****
// Login
// =====

var sess = {
  key: 'user_sid',
  // genid: async function(req) {
  //   console.log("session!")
  //   return tokgen256.generate(); // use UUIDs for session IDs
  // },
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET,
  store: new MongoStore({
    url: mongoDB,
  }),
  cookie: { expires: new Date(2168483647000) }
}

if (process.env.ENV === 'production') {
  console.log("PRODUCTION")
  app.set('trust proxy', 1)  // trust first proxy
  sess.cookie.secure = true  // serve secure cookies
}

app.use(session(sess));

// TODO: is this needed? it should not happen now that I use Mongoose to keep the sessions
app.use((req, res, next) => {
  if (req.cookies && req.cookies.user_sid && !req.session.email) {
    // server restarted but the user is sending the session id
    res.clearCookie('user_sid');
    res.status(401)
    res.send("Please sign in again.")
    return;
  }
  next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.redirect('/dashboard');
  } else {
      next();
  }    
};

app.use(device.capture())

// update when the session was last used
app.use((req, res, next) => {
  if (req.session && req.session.email) {
    console.log(new Date())
    req.session.last_access = new Date()
  }
  next()
})

// app.use(function (req, res, next) {
//   console.log("middleware " + req.session.email)
//   req.session.email = "123@email.com"
//   // if (req.headers['token-id']) {
//   //   console.log("Found token id in request: " + req.headers['token-id'])
//   //   req.session.email = "email@email.com";
//   // }

//   // if (!req.session.email) {
//   //   console.log("No email found for cookie")
//   // }

//   // console.log("continuing")
//   next()
// })

app.use('/home-keeper/login', loginRouter);

// since we need moment in pug
app.locals.moment = require('moment');

// set up MongoDB connection
var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.post('/home-keeper/login/sessions', (req, res, next) => {
  if (req.session.email && req.session.email === process.env.ADMIN_EMAIL) {
    db.db.listCollections().toArray(function (err, names) {
      console.log(names)
    })
    db.db.collection('sessions', function (err, collection) {
      collection.find().sort(['expires']).toArray(function (err, sessions) {
        if (sessions.length > 0) {
          res.send({ title: 'List Sessions', sessions: sessions })
        } else {
          res.send({ title: 'List Sessions', sessions: "No sessions found" })
        }
      })
    })
  }
});

var Schema = mongoose.Schema;
Session = mongoose.model('Session', 
          new Schema({ _id: String, session: String, expires: Date}), 
          'sessions');     // collection name

app.post('/home-keeper/login/revoke-all', async (req, res, next) => {
  if (!req.session.email) {
    // there are errors
    res.status(401)
    res.send("Unautorized.");
    return;
  }
  sessions = await Session.find({'session': { "$regex": req.session.email, "$options": "i" } })
  sessions.forEach(async function (session) {
    console.log("removing " + session._id)
    await Session.findOneAndRemove({ '_id': session._id })
  })
  res.send({ title: "Revoke All", revoked: sessions.length })
});

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
app.use('/home-keeper/static/images', express.static('public/images'));

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
app.use('/home-keeper', homeKeeperRouter);

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
