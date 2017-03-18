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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Session setup + redis for session management
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis   = require("redis");
var client  = redis.createClient();
app.redis = client;

var sessionMiddleware = session({
    // TODO change to env variable
    store: new RedisStore({ host: secrets.redisHost, port: secrets.redisPort, client: client, ttl :  260}),
    secret: secrets.secretCookieCode, /* secret cookie thang (store this elsewhere!) TODO: change this into an env variable*/
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: app.get('env') !== 'development', // Sets to false in dev, and HTTPS-only in production automatically
        maxAge: 600000
    }
});

// Ties sessions into socket.io, will now be available under socket.request.session
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);
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

// Routes
var global = require('./routes/global');
var users = require('./routes/users');
var auth = require('./routes/auth');
var info = require('./routes/info');
var video = require('./routes/video')(io, app);

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
