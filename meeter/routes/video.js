"use strict";
var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

var helper = require('../helper');
// User information gathering route handlers

// Chat
router.get('/chat', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Chat";
        context.active = { chat: true };

        context.js = ["bundle.js"];
        context.css = ["socket.css"];

        // TODO remove after
        console.log("Upon accessing /chat:");
        console.log(req.session);

        res.render('video/chat', context);
    }
    else {
        // User is not logged in, just redirects to the login page
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=chat');
    }
});

// Schedule
router.get('/schedule', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Schedule";
        context.active = { schedule: true };
        res.render('video/schedule', context);
    }
    else {
        // User is not logged in, just redirects to the login page
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=schedule');
    }
});

// Search
router.get('/search', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Search";
        context.active = { search: true };
        res.render('video/search', context);
    }
    else {
        // User is not logged in, just redirects to the login page
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=search');
    }
});

module.exports = function(io) {
    //
    // io.on('connection', function (socket) {
    //     console.log("A user has connected to the server");
    //
    //     socket.on('peer-msg', function (data) {
    //         console.log('Message from peer: %s', data);
    //         socket.broadcast.emit('peer-msg', data);
    //     });
    //
    //     socket.on('peer-file', function (data) {
    //         console.log('File from peer: %s', data);
    //         socket.broadcast.emit('peer-file', data);
    //     });
    //
    //     socket.on('go-private', function (data) {
    //         console.log("A user is going private");
    //         socket.broadcast.emit('go-private', data);
    //     });
    // });
    //
    // io.on('go-private', function (data) {
    //     console.log("A user is going private 2");
    //     socket.broadcast.emit('go-private', data);
    // });
    //
    // io.on('disconnect', function (socket) {
    //     console.log("A user has disconnected from the server");
    // });

    // namespaced
    var room = io.of('/university_chat');
    room.on('connection', function (socket) {
        console.log("A user has connected to room university chat");
        console.log("Adding user with session ID: " + socket.request.sessionID + " and socket ID: " + socket.id);

        socket.request.session.socketID = socket.id;
        socket.request.session.save();
        console.log(socket.request.session);

        socket.on('upgrade', function (data) {
            console.log("A user is upgrading");
            socket.broadcast.emit('upgrade', data);
        });

        socket.on('peer-msg', function (data) {
            console.log('Message from peer: %s', data);
            socket.broadcast.emit('peer-msg', data);
        });

        socket.on('peer-file', function (data) {
            console.log('File from peer: %s', data);
            socket.broadcast.emit('peer-file', data);
        });

        socket.on('go-private', function (data) {
            console.log("A user is going private");
            socket.broadcast.emit('go-private', data);
        });

        socket.on('disconnect', function() {
            console.log("User session ID: " + socket.request.sessionID + " disconnected");
        });
    });
    
    return router;
};
