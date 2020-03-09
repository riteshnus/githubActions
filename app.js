var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');

var accessToken = '';
passport.use(new GitHubStrategy({
    clientID: 'df43d5c37b3c1560c468',
    clientSecret: '3aa11e2e6b05d35358c2e7059b7b5e8d20a8efd1',
    callbackURL: "http://13.229.56.203/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile)
      console.log('accessToken', accessToken)
      return done(null, { profile, accessToken });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(require('morgan')('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.sendFile('auth.html', { root : path.join(__dirname, 'views')});
})
app.use('/error', function(req, res) {
  res.sendFile('error.html', { root : path.join(__dirname, 'views')});
})
app.use('/deploy', function(req, res) {
  console.log('print res', res)
  res.sendFile('deploy.html', { root : path.join(__dirname, 'views'), data : 'abc'});
});

// Authentication
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/error' }),
  function(req, res) {
    console.log('got token: ', req.user.accessToken)
    res.cookie('token', req.user.accessToken , { expires: new Date(Date.now() + 900000), httpOnly: false })
    res.redirect('/deploy');
  }
);

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
