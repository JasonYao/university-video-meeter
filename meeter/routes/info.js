"use strict";
var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

var helper = require('../helper');
// User information gathering route handlers

// Optional user information
router.get('/optional', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        var context = {};
        context.messages = helper.getFlashMessages(req);
        context.title = "Profile Information";
        res.render('info/optional', context);
    }
    else {
        // User is not logged in, just redirects to the login page
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=optional');
    }
});

// Requirements for file upload/S3
var multer  = require('multer');                                                            // Used for multi-part file uploading
var path = require('path');
var FILESIZE_LIMIT = 4 * 1000 * 1000; // 4 MB in bytes
var upload = multer({
    dest: 'public/img/uploads/',
    limits: { fileSize: FILESIZE_LIMIT },
    fileFilter: function(req, file, callback) {
        var validFileTypes = /jpeg|jpg|gif|png/;
        var mimetype = validFileTypes.test(file.mimetype);
        var extension = validFileTypes.test(file.originalname);

        if (mimetype && extension)
            return callback(null, true);
        callback(new Error('The image you have uploaded is not a valid image. Please make sure it is a .jpg, .gif, or .png file type.'));
    }
});
var aws = require('../aws');

var multerUpload = upload.single('photo');

// NOTE: I am so sorry about this function. It works, but is ugly to all hell from callback hell instead of promises
// REFACTOR here later when possible.
router.post('/optional', function(req, res, next) {
    if (req.user) {
        // Skip check to see if the user declined to give information for now
        if (req.body.skip) {
            if (req.user.isAmbassador)
                res.redirect('/ambassador');
            else
                res.redirect('/dashboard');
        }
        else {
            var context = {};
            context.title = "Profile Information";

            // User is an authenticated user and has not skipped, so go ahead and process the form
            multerUpload(req, res, function (err) {
                if (err) {
                    // Error handling if the image validation fails
                    req.flash('danger', err.message);
                    context.messages = helper.getFlashMessages(req);
                    res.render('info/optional', context);
                }
                else {
                    // No errors to deal with, and we know the image is valid, so uploads the file to AWS S3 bucket

                    // User has added some new info
                    User.findById(req.user._id, function(err, user) {
                        if (err) {
                            req.flash('danger', err.message);
                            context.messages = helper.getFlashMessages(req);
                            res.render('info/optional', context);
                        }
                        else {
                            // Sets the user input
                            user.bio = req.body.bio;
                            user.location = req.body.location;
                            user.languagePreference = req.body.languagePreference;

                            // Uploads the user's given file to S3 if required
                            aws.uploadToS3(req.file, function (response) {
                                if (response.errors) {
                                    req.flash('danger', response.errors);
                                    context.messages = helper.getFlashMessages(req);
                                    res.render('info/optional', context);
                                }
                                else {
                                    // Successfully uploaded to S3
                                    user.photo = response.link;

                                    user.save(function(err) {
                                        if (err) {
                                            req.flash('danger', err.message);
                                            context.messages = helper.getFlashMessages(req);
                                            res.render('info/optional', context);
                                        }
                                        else {
                                            // User's information was updated, moves to ambassador information if relevant
                                            req.flash('success', "Your profile information has successfully updated!");
                                            if (user.isAmbassador)
                                                res.redirect('/ambassador');
                                            else
                                                res.redirect('/dashboard');
                                        }
                                    });
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
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=optional');
    }
});

// Ambassador register page
router.get('/ambassador', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        if (req.user.ambassadorID) {
            // User already has created their ambassador info, redirects to the dashboard
            req.flash("warning", "Your initial ambassador profile information has already been created! To update your information, please go to your user settings.");
            res.redirect('/dashboard');
        }
        else {
            // User has not created their ambassador ID
            var context = {};
            context.messages = helper.getFlashMessages(req);
            context.title = "Ambassador Information Registration";
            res.render('info/ambassador', context);
        }
    }
    else {
        // User is not logged in, just redirects to the login page
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=ambassador');
    }
});

router.post('/ambassador', function(req, res, next) {
    if (req.user) {
        // User is already logged in
        if (req.user.ambassadorID) {
            // User already has created their ambassador info, redirects to the dashboard
            req.flash("warning", "Your initial ambassador profile information has already been created! To update your information, please go to your user settings.");
            res.redirect('/dashboard');
        }
        else {
            var context = {};
            context.title = "Ambassador Information Registration";

            // User has not created their ambassador information, attempts to create it now
            var ambassadorProfile = new Ambassador({
                university: req.body.university,
                universityLocation: req.body.universityLocation,
                currentYear: req.body.currentYear,
                languagesSpoken: req.body.languagesSpoken,
                clubs: req.body.clubs
            });

            ambassadorProfile.save(function (err, ambassador, count) {
                if (err) {
                    req.flash('danger', err.message);
                    context.messages = helper.getFlashMessages(req);
                    res.render('info/ambassador', context);
                }
                else {
                    // Updates the user's ambassador profile with the correct document ID
                    User.update({username: req.user.username}, {$set: {'ambassadorID': ambassadorProfile.id}}, {upsert:true}, function(err, data) {
                        if (err) {
                            req.flash("danger", err.message);
                            context.messages = helper.getFlashMessages(req);
                            res.render('info/ambassador', context);
                        }
                        else {
                            req.flash("info", "Your ambassador information was successfully added!");
                            res.redirect('/dashboard');
                        }
                    });
                }
            });
        }
    }
    else {
        // User is not logged in, just redirects to the login page
        req.flash("info", "Please log in to see this page.");
        res.redirect('/login?next=ambassador');
    }
});

module.exports = router;
