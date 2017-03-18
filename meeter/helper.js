"use strict";
// Helper functions

function getFlashMessages(req) {
    var messages = [];

    // Deals with success messages
    var success = req.flash('success');
    for (var i = 0; i < success.length; ++i)
        messages.push({alertType: "success", message: success[i]});

    // Deals with info messages
    var info = req.flash('info');
    for (i = 0; i < info.length; ++i)
        messages.push({alertType: "info", message: info[i]});

    // Deals with warning messages
    var warning = req.flash('warning');
    for (i = 0; i < warning.length; ++i)
        messages.push({alertType: "warning", message: warning[i]});

    // Deals with danger messages
    var danger = req.flash('danger');
    for (i = 0; i < danger.length; ++i)
        messages.push({alertType: "danger", message: danger[i]});

    return messages;
} // End of the getFlashMessages function

// Middleware to check that the user is already logged in
function isAuthenticated(req, res, next) {
    req.session.redirect_to = req.path;
    if (req.isAuthenticated())
        return next();
    else {
        req.flash('info', 'Please log in to access this page.');
        res.redirect('/login');
    }
} // End of the isAuthenticated function

/**
 * Functions that are enabled to be exported for use in other files
 */
module.exports = {
    getFlashMessages: getFlashMessages,
    isAuthenticated: isAuthenticated
};