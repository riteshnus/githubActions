var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: 'facb2d696c68728e154b',
    clientSecret: 'bffe4c4fc4febb93ad0d95b4c2782fc532604e12',
    callbackURL: "http://bef8f483.ngrok.io/auth/github/callback"
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
app.get('/sit', function (req, res) {
  res.sendFile('sit.html', { root: path.join(__dirname, 'views') });
})
app.get('/uat', function (req, res) {
  res.sendFile('uat.html', { root: path.join(__dirname, 'views') });
})
app.use('/error', function(req, res) {
  res.sendFile('error.html', { root : path.join(__dirname, 'views')});
})
app.use("/dashboard", function(req, res) {
  res.sendFile("dashboard.html", { root: path.join(__dirname, "views")});
});

// Authentication
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/error' }),
  function(req, res) {
    console.log('got token: ', req.user.accessToken)
    res.cookie('token', req.user.accessToken , { expires: new Date(Date.now() + 900000), httpOnly: false })
    res.redirect('/dashboard');
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
