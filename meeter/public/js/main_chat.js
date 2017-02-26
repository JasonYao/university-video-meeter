"use strict";
var P2P = require('socket.io-p2p');
var io = require('socket.io-client');

// DOM hooks
var messageForm = document.forms['message_form'];
var messageButton = document.getElementById("send_message_button");
var chat = document.getElementById("messages");
var privateButton = document.getElementById("private");

// Helper methods
function addMessage(message, side) {
    var newMessage = document.createElement('li');
    newMessage.appendChild(document.createTextNode(message));
    newMessage.classList.add(side);
    chat.appendChild(newMessage);
}

// Sets up the DOM event listeners
function setupForm(P2PSocket) {
    messageButton.addEventListener("click", function (event) {
        var message = messageForm.m.value;

        // Disables the default
        event.preventDefault();

        // Clear it from the form
        messageForm.m.value = "";

        // Adds the message to the current chat (right, self side)
        addMessage(message, "self");

        // Send the message to the server
        P2PSocket.emit('peer-msg', message);
    });

    privateButton.disabled = false;
    privateButton.addEventListener('click', function (e) {
        addMessage("private button was clicked", "self");
        // goPrivate();
        P2PSocket.emit('upgrade', { peerId: P2PSocket.peerId });
    });
} // End of the setupForm function

// Sets up the actual socket.io connection
function setupSocketIO() {
    // Initially connects to the server for signalling information
    var socket = io('/university_chat'); // TODO change the namespace after to be dynamic

    var opts = {peerOpts: {numClients: 10}};
    var P2PSocket = new P2P(socket, opts, function () {
        P2PSocket.emit('peer-obj', 'Hello there. I am ' + P2PSocket.peerId);
    });

    P2PSocket.once('connect', function () {
        addMessage("Initially connecting to server for signalling", "self"); // TODO remove after
        document.getElementById("status").textContent = "CONNECTED";

        // Removes any prior conflicting classes
        document.getElementById("status").classList.remove("disconnected");
        document.getElementById("status").classList.add("connected");

        //P2PSocket.usePeerConnection = true; // TODO this should work to upgrade to webRTC, but doesn't.
        setupForm(P2PSocket);
    });

    // Error handling if it can't reach the server
    P2PSocket.on('disconnect', function() {
        addMessage("Disconnected from the server", "self"); // TODO remove after
        document.getElementById("status").textContent = "DISCONNECTED";

        // Removes any prior conflicting classes
        document.getElementById("status").classList.remove("connected");
        document.getElementById("status").classList.add("disconnected");
    });

    // Actual messaging via sockets
    // Triggered over socket transport until `usePeerConnection` is set to `true`
    P2PSocket.on('peer-msg', function(message){
        addMessage(message, "other");
    });

    P2PSocket.on('peer-error', function (data) {
        addMessage("Inside of peer-error call", "self");
        document.getElementById("status").classList.remove("connected");
        document.getElementById("status").classList.add("disconnected");
        document.getElementById("status").textContent = "Private WebRTC connection failed to upgrade!";
    });

    // Upgrading connection
    // P2P upgraded peer connection
    function goPrivate () {
        addMessage("going private function was called", "self");
        //P2PSocket.useSockets = false;
        //P2PSocket.usePeerConnection = true;
        //P2PSocket.upgrade();

        //socket.broadcast.to(id).emit('my message', msg);

        document.getElementById("status").textContent = "Private WebRTC connection established!";
        privateButton.disabled = true;
    }

    P2PSocket.on('upgrade', function (data) {
        addMessage("Upgrade function was called, going private", "self");
        addMessage("Peer ID is: " + data);
        goPrivate();
    });
} // End of the setupSocketIO function

function init() {
    setupSocketIO();

    // P2P upgraded peer connection
    // privateButton.addEventListener('click', function (e) {
    //     addMessage("private button was clicked", "self");
    //     goPrivate();
    //     P2PSocket.emit('go-private', { peerId: P2PSocket.peerId });
    // });

    // P2PSocket.on('upgrade', function (data) {
    //     addMessage("Inside of upgrade call", "self");
    // });

    // P2PSocket.on('ready', function() {
    //     addMessage("Ready was called", "self");
    //
    //     P2PSocket.usePeerConnection = true;
    //     P2PSocket.emit('peer-obj', { peerId: peerId });
    // });

    // P2PSocket.on('connect', function (socket) {
    //     addMessage("Join_room function was called", "self");
    //     var clients = [];
    //     clients[socket.id] = socket;
    //     socket.join("room1");
    //     p2p(socket, null, room);
    // });


//
// function join_room(room) {
//
//
//     io.join(room);
//     // P2PSocket.on('connection', function(socket){
//     //     addMessage("Joining room: " + room, "self");
//     //     socket.join(room);
//     // });
// };

}

document.addEventListener('DOMContentLoaded', init, false);