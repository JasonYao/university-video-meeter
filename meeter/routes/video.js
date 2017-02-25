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

module.exports = router;
