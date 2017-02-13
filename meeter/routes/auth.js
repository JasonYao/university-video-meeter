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
                var nextLink = helper.getNext(req.query);
                if (nextLink)
                    res.redirect(nextLink);
                else
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
                        res.redirect('/optional?next=ambassador');
                    });
                }
                else {
                    // Not an ambassador, so just logs the user into the dashboard
                    passport.authenticate('local')(req, res, function() {
                        res.redirect('/optional');
                    });
                }
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
    context.title = "Password Reset";
    res.render('auth/reset', context);
});

module.exports = router;
