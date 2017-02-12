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
    var context = {};
    context.errors = helper.getErrors(req.query);
    if (req.user) {
        // User has already logged in
        context.title = "Dashboard";
        res.render('users/dashboard', context);
    }
    else {
        // User has not logged in yet
        res.redirect('/login?errors=LoginRequiredError&next=dashboard');
    }
});

// Profile page
router.get('/profile', function(req, res, next) {
    var context = {};
    context.errors = helper.getErrors(req.query);
    if (req.user) {
        // User has already logged in
        context.title = "Profile";
        res.render('users/profile', context);
    }
    else {
        // User has not logged in yet
        res.redirect('/login?errors=LoginRequiredError&next=profile');
    }
});

module.exports = router;
