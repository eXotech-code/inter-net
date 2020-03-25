// use only the newest syntax
"use strict";

// imports
var fs = require("fs");
var express = require("express");
var app = express();
var https = require("https");
var io = require("socket.io")(https);

// https
var credentials = {
    key: fs.readFileSync("035F74995E93AA049E7FC5B0590861E4.key"),
    cert: fs.readFileSync("035F74995E93AA049E7FC5B0590861E4.crt")
};

// function
function incomingMessageHandler(message, address) {
    address = address.replace("::ffff:", "");
    var messageObject = {
        message: message,
        address: address
    };
    messageObject = commands(messageObject);
    messages.push(messageObject);
    console.log(messages);
    console.log("Amount of messages in an array: " + messages.length);
}

function commands(messageObject) {
    if (messageObject.message.includes("/help")) {
        // this will later be a part of server side code
        messageObject.message =
            "/help - show this help screen, /weather - show weather in your location (Not yet added.)";
        messageObject.address = "COMMANDS";
        return messageObject;
    } else if (messageObject.message.includes("/admin")) {
        // this will later be a part of server side code
        messageObject.message = messageObject.message.replace("/admin", "");
        messageObject.address = "DEV";
        return messageObject;
    } else {
        return messageObject;
    }
}

// variables
var messages = [];

// serving index.html
app.use(express.static(__dirname));

// socket handling logic
io.on("connection", function(socket) {
    console.log("Client has been connected.");
    socket.on("chat message", function(message) {
        var address = socket.handshake.address;
        console.log("Message received from " + address + " - " + message);
        incomingMessageHandler(message, address);
        io.emit("chat message", { messagesArray: messages });
    });
    socket.on("disconnect", function() {
        console.log("Client has been disconnected.");
    });
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, function() {
    console.log("Listening on port: 443");
});
