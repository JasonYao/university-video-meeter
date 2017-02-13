"use strict";
var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

var helper = require('../helper');
// Auth route handlers

// Optional
router.get('/optional', function(req, res, next) {
    var context = {};
    context.errors = helper.getErrors(req.query);

    if (req.user) {
        // User is already logged in
        context.title = "Profile Information";
        res.render('auth/optional', context);
    }
    else {
        // User is not logged in, just redirects to the login page
        res.redirect('/login?errors=LoginRequiredError&next=optional');
    }
});

// Requirements for file upload/S3
var multer  = require('multer');                            // Used for multi-part file uploading
var upload = multer({ dest: 'public/img/uploads/' });       // Used for multi-part file uploading
var aws = require('../aws');

router.post('/optional', upload.single('photo'), function(req, res, next) {
    console.log(req.files);
    console.log(req.file);


    var context = {};
    if (req.user) {
        if (req.body.skip) {
            // User has decided to skip adding optional information
            var nextLink = helper.getNext(req.query);
            if (nextLink)
                res.redirect(nextLink);
            else
                res.redirect('/dashboard');
        }
        else {
            // User has added some new info
            User.findById(req.user._id, function(err, user) {
                if (err) {
                    context.errors = [err]; // Apparently err doesn't ever give multiple in this case, so we can just wrap it
                    context.title = "Profile Information";
                    res.render('auth/optional', context);
                }
                else {
                    // Sets the user input
                    user.bio = req.body.bio;
                    user.location = req.body.location;
                    user.languagePreference = req.body.languagePreference;

                    // Uploads the user's given file to S3 if required
                    aws.uploadToS3(req.file, function (response) {
                        if (response.errors) {
                            context.errors = [response.errors];
                            res.render('optional', context);
                        }
                        else {
                            // Successfully uploaded to S3
                            user.photo = response.link;

                            user.save(function(err) {
                                if (err) {
                                    context.errors = [err]; // Apparently err doesn't ever give multiple in this case, so we can just wrap it
                                    context.title = "Profile Information";
                                    res.render('auth/optional', context);
                                }
                                else {
                                    // User's information was updated, moves to ambassador information if relevant
                                    var nextLink = helper.getNext(req.query);
                                    if (nextLink)
                                        res.redirect(nextLink);
                                    else
                                        res.redirect('/dashboard');
                                }
                            });
                        }
                    });
                }
            });
        }
    }
    else {
        // User is not logged in, just redirects to the login page
        res.redirect('/login?errors=LoginRequiredError&next=optional');
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
        res.redirect('/login?errors=LoginRequiredError&next=ambassador');
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
        res.redirect('/login?errors=LoginRequiredError&next=ambassador');
    }
});

module.exports = router;
