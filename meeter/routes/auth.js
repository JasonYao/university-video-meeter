"use strict";
var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

// Auth route handlers

// Login page
router.get('/login', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        res.redirect('/');
    }
    else {
        // User has not logged in yet
        var context = {};
        context.title = "Login";
        res.render('auth/login', context);
    }
});

router.post('/login', function(req,res,next) {
    passport.authenticate('local', function(err,user) {
        if(user) {
            req.logIn(user, function(err) {
                res.redirect('/dashboard');
            });
        }
        else {
            var context = {};
            context.title = "Login";
            context.errors = [{
                type: "AuthError",
                message: "Your login or password is incorrect.",
                alertType: "danger"
            }];
            res.render('auth/login', context);
        }
    })(req, res, next);
});

// Register page
router.get('/register', function(req, res, next) {
    var context = {};
    if (req.user) {
        // User is already logged in, disables registration
        context.title = "Dashboard";
        context.errors = [{
            type: "AuthError",
            message: "You have already created and logged into an account.",
            alertType: "warning"
        }];
        res.render('dashboard', context);
    }
    else {
        // No user is logged in yet
        context.title = "Register";
        res.render('auth/register', context);
    }
});

router.post('/register', function(req, res) {
    var context = {};
    if (req.user) {
        // User is already logged in, just redirects to the dashboard
        context.title = "Dashboard";
        context.errors = [{
            type: "AuthError",
            message: "You have already created and logged into an account.",
            alertType: "warning"
        }];
        res.render('dashboard', context);
    }
    else {
        // No user is logged in yet
        User.register(new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username
        }), req.body.password, function(err, user) {
            if (err) {
                context.title = "Register";
                context.errors = [{
                    type: err.name,
                    message: err.message,
                    alertType: "danger"
                }];
                res.render('auth/register', context);
            }
            else {
                // Deals with the case when the student is an ambassador
                if (req.body.isAmbassador) {
                    // Moves the user to the ambassador info page
                    passport.authenticate('local')(req, res, function() {
                        res.redirect('/ambassador');
                    });
                }
                else {
                    // Not an ambassador, so just logs the user into the dashboard
                    passport.authenticate('local')(req, res, function() {
                        res.redirect('/dashboard');
                    });

                }
            }
        });
    }
});

// Ambassador register page
router.get('/ambassador', function(req, res, next) {
    var context = {};
    if (req.user) {
        // User is already logged in
        if (req.user.ambassadorID) {
            // User already has created their ambassador info, redirects to the dashboard
            context.errors = [{
                type: "AuthError",
                message: "You have already created your ambassador profile information.",
                alertType: "warning"
            }];
            context.title = "Dashboard";
            res.render('dashboard', context);
        }
        else {
            // User has not created their ambassador ID
            context.title = "Ambassador Information Registration";
            res.render('auth/register-ambassador', context);
        }
    }
    else {
        // User is not logged in, just redirects to the login page
        res.redirect('/login');
    }
});

router.post('/ambassador', function(req, res, next) {
    var context = {};
    if (req.user) {
        // User is already logged in
        if (req.user.ambassadorID) {
            // User already has created their ambassador info, redirects to the dashboard
            context.errors = [{
                type: "AuthError",
                message: "You have already created your ambassador profile information.",
                alertType: "warning"
            }];
            context.title = "Dashboard";
            res.render('dashboard', context);
        }
        else {
            var ambassadorProfile = new Ambassador({
                university: req.body.university,
                universityLocation: req.body.universityLocation,
                currentYear: req.body.currentYear,
                languagesSpoken: req.body.languagesSpoken,
                clubs: req.body.clubs
            });

            ambassadorProfile.save(function (err, ambassador, count) {
                if (err) {
                    context.errors = [err];
                    context.title = "Ambassador Information Registration";
                    res.render('auth/register-ambassador', context);
                }
                else {
                    // Updates the user's ambassador profile
                    User.update({username: req.user.username}, {$set: {'ambassadorID': ambassadorProfile.id}}, {upsert:true}, function(err, data) {
                        res.redirect('/dashboard');
                    });
                }
            });
        }
    }
    else {
        // User is not logged in, just redirects to the login page
        res.redirect('/login');
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
    context.title = "Password Reset";
    res.render('auth/reset', context);
});

module.exports = router;
