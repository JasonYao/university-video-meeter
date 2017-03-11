"use strict";
var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

var helper = require('../helper');
// User information gathering route handlers

var users = {};

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

        // TODO: Point of inefficiency, getting a list of a user's connections on every request is slow, add
        // TODO: in a caching layer later on for speed boost
        User.find( { _id: { $in: req.user.connections} }, function (err, connections, count) {
            if (err) {
                req.flash("danger", "Sorry, an error occurred when trying to find your connections list (they exist, we swear!)");
                res.redirect('/chat');
            }
            else {
                // We pass back the full connections list, and have the client-side perform an XHR to get active status
                context.connections = connections;
                res.render('video/chat', context);
            }
        });
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

router.get('/api/active', function (req, res, next) {
    if (req.query.users) {
        // Makes sure that it's an array
        var givenUsers = req.query.users.constructor === Array ? req.query.users : [req.query.users];

        // Gets the list of active connections from the friends list
        var activeConnectionsList = [];
        for (var i = 0; i < givenUsers.length; ++i)
            users[givenUsers[i]] ? activeConnectionsList.push(true) : activeConnectionsList.push(false);

        res.json(activeConnectionsList);
    }
    else {
        // Bad request, just sends a 400 status code back
        res.sendStatus(400);
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

        // Adds it to the global list of online users
        if (socket.request.session.passport && !users[socket.request.session.passport.user])
            users[socket.request.session.passport.user] = {socketID: socket.id};

        socket.request.session.socketID = socket.id;
        socket.request.session.save();

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

            // Removes the user form the global active connection list
            if (socket.request.session.passport && users[socket.request.session.passport.user])
                users[socket.request.session.passport.user] = undefined;
        });
    });

    return router;
};
