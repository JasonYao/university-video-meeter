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

        var redis = req.app.redis;

        // We only get the list if its the first time, otherwise we depend upon the cache
        redis.get("active:" + req.user.username, function (err, value) {
            if (err)
                throw new Error("An error occurred when connecting to the cache: " + err.message);

            if (value) {
                // Not first time, just uses cached value
                console.log("User was found in cache, using cached values");
                context.connections = value;
                res.render('video/chat', context);
            }
            else {
                console.log("User was not found in cache, hitting DB for fresh source");
                // First time, need to find all connections
                User.find( { _id: { $in: req.user.connections} }, function (err, connections, count) {
                    if (err) {
                        req.flash("danger", "Sorry, an error occurred when trying to find your connections list (they exist, we swear!)");
                        res.redirect('/chat');
                    }
                    else {
                        /*
                        * We now have the list of connections for this user.
                        * This'll be passed back, and the client-side will
                        * perform an XHR to get the active status of people
                        * TODO efficiency operation: We don't need full user objects, just username/objectID
                        * TODO security operation: If the redis cluster is breached, emails and other private
                        * information will be leaked. Filter out information prior to insertion into cluster.
                        * */

                        redis.set("active:" + req.user.username, connections.toString());
                        context.connections = connections;
                        res.render('video/chat', context);
                    }
                });
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
        var redis = req.app.redis;
        // Makes sure that it's an array
        var givenUsers = req.query.users.constructor === Array ? req.query.users : [req.query.users];

        // Gets the list of connections that are online right now
        var activeConnectionsList = [];

        givenUsers.forEach(function (connection) {
            redis.get("active:" + connection, function (err, value) {
                if (err)
                    throw new Error("An error occurred when connecting to the cache: " + err.message);

                // Adds the user to the active list if value was found in cache
                activeConnectionsList.push(value ? true : false);

                // TODO return after the .forEach is done with res.json, but only after the .forEach completes
                if (activeConnectionsList.length === givenUsers.length)
                    res.json(activeConnectionsList);
            });
        });
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

            // Removes the socket from the current session
            if (socket.request.session.socketID)
                socket.request.session.socketID = undefined;
        });
    });

    return router;
};
