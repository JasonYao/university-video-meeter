"use strict";
const express = require('express');
const router = express.Router();
const helper = require('../helper');

// Home page
router.get('/', function(req, res, next) {
    if (req.user)
        res.redirect('/dashboard');
    else {
        var context = {};
        context.messages = helper.getFlashMessages(req);

        context.title = "Home";
        context.active = { home: true };

        res.render('global/index', context);
    }
});

// About page
router.get('/about', function (req, res, next) {
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "About Us";
    context.active = { about: true };

    res.render('global/about', context);
});

// Help page
router.get('/help', function (req, res, next) {
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "Help";
    context.active = { help: true };

    res.render('global/help', context);
});

// Universities page
router.get('/universities', function (req, res, next) {
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "University Partners";
    context.active = { universities: true };

    res.render('global/universities', context);
});

// Pricing page
router.get('/pricing', function (req, res, next) {
    var context = {};
    context.messages = helper.getFlashMessages(req);
    context.title = "Pricing";
    context.active = { pricing: true };

    res.render('global/pricing', context);
});

// Universities Ambassadors page
router.get('/universities/:university/ambassadors', function (req, res, next) {
    var universityName = req.params.university;
    var context = {};
    context.messages = helper.getFlashMessages(req);
    // TODO university lookup


    context.title = "University Ambassadors";
    context.active = { universityAmbassadors: true };

    res.render('global/university_ambassadors', context);
});

module.exports = router;
