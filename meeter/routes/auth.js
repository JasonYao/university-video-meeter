"use strict";
var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

var helper = require('../helper');
// Auth route handlers

// Login page
router.get('/login', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        req.flash("info", "You've already logged in!");
        var nextLink = helper.getNext(req.query);
        if (nextLink)
            res.redirect(nextLink);
        else
            res.redirect('/dashboard');
    }
    else {
        // User has not logged in yet
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Login";
        res.render('auth/login', context);
    }
});

router.post('/login', function(req,res,next) {
    if(req.user) {
        // User has already logged in, just redirects to the dashboard
        req.flash("info", "You've already logged in!");
        var nextLink = helper.getNext(req.query);
        if (nextLink)
            res.redirect(nextLink);
        else
            res.redirect('/dashboard');
    }
    else {
        // User has not logged in yet, so attempts login
        var context = {};
        context.title = "Login";

        passport.authenticate('local', function(err, user) {
            if (err) {
                // Login somehow catastrophically failed
                req.flash("danger", err.message);
                context.messages = helper.getFlashMessages(req);
                context.username = req.body.username;
                res.render('auth/login', context);
            }
            else if (!user) {
                // User's login information was incorrect
                req.flash("danger", "Your username/password combination was incorrect.");
                context.messages = helper.getFlashMessages(req);
                context.username = req.body.username;
                res.render('auth/login', context);
            }
            else {
                // No errors, runs through login procedure
                req.logIn(user, function(err) {
                    if (err) { return next(err); }

                    var nextLink = helper.getNext(req.query);
                    if (nextLink)
                        res.redirect(nextLink);
                    else
                        res.redirect('/dashboard');
                });
            }
        })(req, res, next);
    }
});

// Register page
router.get('/register', function(req, res, next) {
    if (req.user) {
        // User is already logged in, disables registration
        req.flash("info", "You've already logged in!");
        res.redirect("/dashboard");
    }
    else {
        // No user is logged in yet
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Register";
        res.render('auth/register', context);
    }
});

router.post('/register', function(req, res, next) {
    if (req.user) {
        // User is already logged in, just redirects to the dashboard
        req.flash("info", "You've already logged in!");
        res.redirect("/dashboard");
    }
    else {
        // No user is logged in yet
        User.register(new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            isAmbassador: req.body.isAmbassador !== undefined
        }), req.body.password, function(err, user) {
            if (err) {
                var context = {};
                context.title = "Register";
                req.flash("danger", err.message);
                context.messages = helper.getFlashMessages(req);
                res.render("auth/register", context);
            }
            else {
                passport.authenticate('local')(req, res, function() {
                    req.flash("success", "Your account has successfully been created!");
                    res.redirect('/optional');
                });
            }
        });
    }
});

// Logout page
router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

// Password reset page
router.get('/reset', function (req, res, next) {
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "Password Reset";
    res.render('auth/reset', context);
});

module.exports = router;
