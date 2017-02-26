"use strict";
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

// Auth and db requirements
var passport = require('passport');
require('./db');
require('./auth');
var secrets = require('./secrets');

var app = express();

// Socket.io setup
var socketIO = require('socket.io');
var io = socketIO();
app.io = io;
var p2p = require('socket.io-p2p-server').Server;
app.p2p = p2p;

// Routes
var global = require('./routes/global');
var users = require('./routes/users');
var auth = require('./routes/auth');
var info = require('./routes/info');
var video = require('./routes/video')(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Session setup
var session = require('express-session');
var sessionOptions = {
    secret: secrets.secretCookieCode, /* secret cookie thang (store this elsewhere!) */
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());

// Auth setup (via passport)
app.use(passport.initialize());     // passport initialize middleware
app.use(passport.session());        // passport session middleware

// Makes user data available to all templates
app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json({limit: '4mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '4mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Active routes with name-spacing
app.use('/', global);
app.use('/', auth);
app.use('/', users);
app.use('/', info);
app.use('/', video);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
