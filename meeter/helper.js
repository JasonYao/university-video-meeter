// Helper functions
function getErrors(query) {
    var errors = [];

    if (query === undefined || query.errors === undefined)
        return errors;

    // Converts the errors to an array if it is a single error
    if (query.errors.constructor !== Array)
        query.errors = [query.errors];

    for (var i = 0; i < query.errors.length; ++i) {
        switch(query.errors[i]) {
            case "LoginRequiredError":
                errors.push({
                    type: "LoginRequiredError",
                    message: "You'll need to login first to access this page.",
                    alertType: "info"
                });
                break;
            case "AuthError":
                errors.push({
                    type: "AuthError",
                    message: "Your login or password is incorrect.",
                    alertType: "danger"
                });
                break;
            case "DuplicateAuthError":
                errors.push({
                    type: "DuplicateAuthError",
                    message: "You have already created and logged into an account.",
                    alertType: "warning"
                });
                break;
            case "AmbassadorDuplicateError":
                errors.push({
                    type: "AmbassadorDuplicateError",
                    message: "You have already created your ambassador profile information.",
                    alertType: "warning"
                });
                break;
            default:
                errors.push({
                    type: "UnknownError",
                    message: "Sorry, but an unknown error occurred. Please try again.",
                    alertType: "danger"
                });
        }
    }
    return errors;
} // End of the getErrors function

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

/**
 * Functions that are enabled to be exported for use in other files
 */
module.exports = {
    getErrors: getErrors,
    getNext: getNext
};