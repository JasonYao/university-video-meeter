var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ambassador = mongoose.model('Ambassador');

// Auth route handlers

// Login page
router.get('/login', function(req, res, next) {
    if (req.user === undefined) {
        // User has not logged in yet
        var context = {};
        context.title = "Login";
        res.render('auth/login', context);
    }
    else {
        // User is already logged in
        res.redirect('/');
    }
});

router.post('/login', function(req,res,next) {
    passport.authenticate('local', function(err,user) {
        if(user) {
            req.logIn(user, function(err) {
                res.redirect('/dashboard');
            });
        } else {
            var context = {};
            context.title = "Login";
            context.errors = ["Your login or password is incorrect."];
            res.render('auth/login', context);
        }
    })(req, res, next);
});

// Register page
router.get('/register', function(req, res, next) {
    if (req.user) {
        // User is already logged in, disables registration
        res.redirect('/dashboard');
    }
    else {
        // No user is logged in yet
        var context = {};
        context.title = "Register";
        res.render('auth/register', context);
    }
});

router.post('/register', function(req, res) {
    if (req.user) {
        // User is already logged in, just redirects to the dashboard
        res.redirect('/dashboard');
    }
    else {
        // No user is logged in yet
        User.register(new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username:req.body.username
        }), req.body.password, function(err, user) {
            if (err) {
                // TODO add UserExistsError
                res.render('auth/register', {message: err});
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
    if (req.user) {
        // User is already logged in
        if (req.user.ambassadorID) {
            // User already has created their ambassador info, redirects to the dashboard
            res.redirect('/dashboard');
        }
        else {
            // User has not created their ambassador ID
            var context = {};
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
    if (req.user) {
        // User is already logged in
        if (req.user.ambassadorID) {
            // User already has created their ambassador info, redirects to the dashboard
            res.redirect('/dashboard');
        }
        else {
            var ambassadorProfile = new Ambassador({
                university: req.body.university,
                universityLocation: req.body.universityLocation,
                currentYear: req.body.currentYear,
                languagesSpoken: req.body.languagesSpoken,
                clubs: req.body.clubs
            });

            var context = {};

            ambassadorProfile.save(function (err, ambassador, count) {
                if (err) {
                    context.message = err;
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
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// Password reset page
// TODO

module.exports = router;
