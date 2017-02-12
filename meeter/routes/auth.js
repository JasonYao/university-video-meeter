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
    var context = {};
    context.errors = helper.getErrors(req.query);

    if (req.user) {
        // User is already logged in
        res.redirect('/dashboard');
    }
    else {
        // User has not logged in yet
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
            res.redirect("/login?errors=AuthError");
        }
    })(req, res, next);
});

// Register page
router.get('/register', function(req, res, next) {
    var context = {};
    context.errors = helper.getErrors(req.query);

    if (req.user) {
        // User is already logged in, disables registration
        res.redirect("/dashboard?errors=DuplicateAuthError");
    }
    else {
        // No user is logged in yet
        context.title = "Register";
        res.render('auth/register', context);
    }
});

router.post('/register', function(req, res, next) {
    if (req.user) {
        // User is already logged in, just redirects to the dashboard
        res.redirect("/dashboard?errors=DuplicateAuthError");
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
                var context = {};
                context.title = "Register";
                context.errors = [];
                // Since error handling in express is retarded, we need to singularly deal
                // with single errors and multi errors
                if (err.errors) {
                    // multiple errors detected, adds them all in
                    for (var key in err.errors) {
                        context.errors.push({
                            type: err.errors[key].name,
                            message: err.errors[key].message,
                            alertType: "warning"
                        });
                    }
                }
                else {
                    context.errors.push({
                        type: err.name,
                        message: err.message,
                        alertType: "warning"
                    });
                }
                res.render("auth/register", context);
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
    context.errors = helper.getErrors(req.query);

    if (req.user) {
        // User is already logged in
        if (req.user.ambassadorID) {
            // User already has created their ambassador info, redirects to the dashboard
            res.redirect('/dashboard?errors=AmbassadorDuplicateError');
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
            res.redirect('/dashboard?errors=AmbassadorDuplicateError');
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
                    context.errors = [err]; // Apparently err doesn't ever give multiple in this case, so we can just wrap it
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
