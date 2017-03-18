"use strict";
const express = require('express');
const router = express.Router();

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Ambassador = mongoose.model('Ambassador');

const helper = require('../helper');
// Auth route handlers

// Login page
router.get('/login', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        req.flash("info", "You've already logged in!");
        res.redirect('/dashboard');
    }
    else {
        // User has not logged in yet
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Login";
        context.active = { login: true };
        res.render('auth/login', context);
    }
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err)
            return next(err);

        if (!user) {
            var context = {};
            context.title = "Login";
            context.active = { login: true };
            context.username = req.body.username;

            req.flash('warning', 'Your username/password combination was not found');
            context.messages = helper.getFlashMessages(req);

            res.render('auth/login', context);
        }
        else {
            req.logIn(user, function(err) {
                if (err)
                    return next(err);

                var redirect = req.session.redirect_to || '/dashboard';
                req.session.redirect_to = undefined;
                return res.redirect(redirect);
            });
        }
    })(req, res, next);
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
        context.active = { register: true };
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
            isAmbassador: req.body.isAmbassador !== undefined,
            connections: []
        }), req.body.password, function(err, user) {
            if (err) {
                var context = {};
                context.title = "Register";
                context.active = { register: true };
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
router.get('/logout', function(req, res, next) {
    if (req.user) {
        var redis = req.app.redis;
        redis.del("active:" + req.user.username, function (err, reply) {
            req.session.destroy();
            req.logout();
            res.redirect('/');
        });
    }
    else {
        req.flash("warning", "You need to login first to logout!");
        res.redirect('/');
    }
});

// Password reset page
router.get('/reset', function (req, res, next) {
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "Password Reset";
    res.render('auth/reset', context);
});

module.exports = router;