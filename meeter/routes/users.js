"use strict";
var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

var helper = require('../helper');

// Dashboard page
router.get('/dashboard', function(req, res, next) {
    if (req.user) {
        // User has already logged in
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Dashboard";
        context.active = { dashboard: true };
        res.render('users/dashboard', context);
    }
    else {
        // User has not logged in yet
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?&next=dashboard');
    }
});

// Profile page
router.get('/profile', function(req, res, next) {
    if (req.user) {
        // User has already logged in
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Profile";
        context.active = { profile: true };
        res.render('users/profile', context);
    }
    else {
        // User has not logged in yet
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=profile');
    }
});

// Settings page
router.get('/settings', function(req, res, next) {
    if (req.user) {
        // User has already logged in
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Settings";
        context.active = { settings: true };
        context.css = ["offcanvas.css"];
        context.js = ["offcanvas.js"];
        res.render('users/settings', context);
    }
    else {
        // User has not logged in yet
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?&next=settings');
    }
});

router.post('/settings', function (req, res, next) {
    if (req.user) {
        // User has already logged in, updates the user information
        var newInformation = {
            photo: req.body.photo,
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            isAmbassador: req.body.isAmbassador !== undefined,
            bio: req.body.bio,
            location: req.body.location,
            languagePreference: req.body.languagePreference
        };

        User.update({username: req.user.username}, {$set: newInformation}, {upsert:true}, function(err, data) {
            if (err) {
                // Something happened that stopped us from updating the user profile
                var context = {};
                req.flash('danger', err.message);
                context.messages = helper.getFlashMessages(req);
                context.title = "Settings";
                context.active = { settings: true };
                context.css = ["offcanvas.css"];
                context.js = ["offcanvas.js"];

                res.render('users/settings', context);
            }
            else {
                // Update is good
                req.flash('success', "Your profile has successfully updated!");
                res.redirect('/settings');
            }
        });
    }
    else {
        // User has not logged in yet
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=settings');
    }
});

module.exports = router;
