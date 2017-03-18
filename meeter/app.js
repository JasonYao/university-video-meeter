"use strict";
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');

// Auth and db requirements
const passport = require('passport');
require('./db');
require('./auth');
const secrets = require('./secrets');

const app = express();

// Socket.io setup
const socketIO = require('socket.io');
const io = socketIO();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Session setup + redis for session management
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis   = require("redis");
const client  = redis.createClient();
app.redis = client;

const sessionMiddleware = session({
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
const global = require('./routes/global');
const users = require('./routes/users');
const auth = require('./routes/auth');
const info = require('./routes/info');
const video = require('./routes/video')(io, app);

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