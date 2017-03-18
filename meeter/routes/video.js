"use strict";
const express = require('express');
const router = express.Router();

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Ambassador = mongoose.model('Ambassador');

const helper = require('../helper');
// User information gathering route handlers

// Chat
router.get('/chat', helper.isAuthenticated, function(req, res, next) {
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

            // NOTE: we need to deserialise, since value is a string, not an object
            context.connections = JSON.parse(value);
            res.render('video/chat', context);
        }
        else {
            console.log("User was not found in cache, hitting DB for fresh source");
            var findPriorConnectionsPromise = User.find({ _id: { $in: req.user.connections} }).exec();
            findPriorConnectionsPromise
                .then(function (connections) {
                    /**
                     * We pass back the list of connections, and the client-side
                     * will fetch the activity status of people based on the cache.
                     * In case of redis breach/leak/better efficiency, no full user
                     * objects are stored, only username/objectID mappings.
                     *
                     * NOTE: We need to serialise the connections list into a string for redis to handle,
                     * as there isn't any native support for storing full JS objects directly.
                     * Ref: https://stackoverflow.com/questions/16375188/redis-strings-vs-redis-hashes-to-represent-json-efficiency
                     */

                    var extractedConnections = connections.map(connection => connection.username);
                    redis.set("active:" + req.user.username, JSON.stringify(extractedConnections));

                    context.connections = extractedConnections;
                    res.render('video/chat', context);
                })
                .catch(function (err) {
                    console.log(err);
                    req.flash("danger", "Sorry, an error occurred when trying to find your connections list (they exist, we swear!)");
                    res.redirect('/chat');
                });
        }
    });
});

// Schedule
router.get('/schedule', helper.isAuthenticated, function(req, res, next) {
    // User is already logged in
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "Schedule";
    context.active = { schedule: true };
    res.render('video/schedule', context);
});

router.get('/api/active', function (req, res, next) {
    if (req.query.users) {
        console.log("API: Active has been correctly hit");
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

                // TODO Use promise for more elegant way to return after the
                // TODO .forEach is done with res.json, but only after the .forEach completes
                if (activeConnectionsList.length === givenUsers.length)
                    res.json(activeConnectionsList);
            });
        });
    }
    else {
        console.log("API: Active has been incorrectly hit");
        // Bad request, just sends a 400 status code back
        res.sendStatus(400);
    }
});

// Search
router.get('/search', helper.isAuthenticated, function(req, res, next) {
    // User is already logged in
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "Search";
    context.active = { search: true };

    // Filters out prior connections and self
    var findPriorConnectionsPromise = User.find({ _id: { $in: req.user.connections} }).exec();

    var priorConnectionsSet = new Set();
    var filteredUsers = [];

    findPriorConnectionsPromise
        .then(function (priorConnections) {
            priorConnections.forEach(function (priorConnection) {
                // NOTE: Type coercion has to occur here, where we explicitly call .toString, otherwise it doesn't work
                priorConnectionsSet.add(priorConnection._id.toString());
            });

            return User.find({}).exec();
        })
        .then(function (users) {
            users.forEach(function (user) {
                // NOTE: Type coercion has to occur here, where we explicitly call .toString, otherwise it doesn't work
                if (user._id.toString() !== req.user._id.toString() && !priorConnectionsSet.has(user._id.toString()))
                    filteredUsers.push(user);
            });
        })
        .then(function () {
            context.users = filteredUsers;
            context.js = ['search.js'];
            res.render('video/search', context);
        })
        .catch(function (err) {
            console.log(err);
            req.flash("danger", "Whoops, looks like there was an error connecting to our internal services - please try again in a little bit");
            res.redirect('/search');
        });
});

module.exports = function(io, app) {
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
        console.log("A user has connected:");
        console.log("\t\tRoom: University chat");
        console.log("\t\tRequest.sessionID:\t\t\t" + socket.request.sessionID);
        console.log("\t\tSocket.id:\t\t\t\t" + socket.id);
        console.log("\t\tsocket.request.session.socketID:\t" + socket.request.session.socketID);

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
            console.log("Disconnecting user's socketID: " + socket.request.session.socketID);

            var redis = app.redis;
            console.log("Deleting from cache socket sessionID: " + "\"sess:" + socket.request.sessionID + "\"");
            redis.keys('*', function (err, keys) {
                // console.log(err, keys);
                // redis.del("sess:" + socket.request.sessionID);
                redis.keys('*', function (err2, keys2) {
                    // console.log(err2, keys2);
                    socket.request.session.socketID = undefined;
                    console.log("Disconnecting user's socketID: " + socket.request.session.socketID);
                });
            });


            // socket.request.sessionID


        });
    });

    return router;
};
