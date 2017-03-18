"use strict";
function init() {
    var requestButtons = document.getElementsByClassName("invite-request");
    var requestButtonsList = Array.prototype.slice.call(requestButtons);
    requestButtonsList.forEach(function (requestButton) {
        requestButton.addEventListener("click", function (event) {
            requestButton.textContent = "Request Sent";
            requestButton.disabled = true;
            requestConnection();
        });
    });
} // End of the init function

document.addEventListener('DOMContentLoaded', init, false);