// Helper functions

// Note: we need to parse this via a function
// because if a malicious user did ?next=something_bad,
// it'd be bad.
function getNext(query) {
    if (query === undefined || query.next === undefined)
        return undefined;

    switch (query.next) {
        case "profile":
            return "/profile";
        case "dashboard":
            return "/dashboard";
        case "settings":
            return "/settings";
        case "ambassador":
            return "/ambassador";
        case "optional":
            return "/optional";
        default:
            return undefined;
    }
} // End of the getNext function


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

/**
 * Functions that are enabled to be exported for use in other files
 */
module.exports = {
    getNext: getNext,
    getFlashMessages: getFlashMessages
};