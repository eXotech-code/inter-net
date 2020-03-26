// use only the newest syntax
"use strict";

// imports
const fs = require("fs");
const express = require("express");
const app = express();

// https
const credentials = {
    key: fs.readFileSync("035F74995E93AA049E7FC5B0590861E4.key"),
    cert: fs.readFileSync("035F74995E93AA049E7FC5B0590861E4.crt")
};

const server = require("https").createServer(credentials, app);
const io = require("socket.io").listen(server);
const port = process.env.PORT || 443;

// function
function incomingMessageHandler(message, address) {
    // clear command
    if (message.includes("/clear")) {
        messages = [];
        message = "cleared messages";
        address = "CLEAR";
    }
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
        messageObject.message =
            "/help - show this help screen, /clear - clear all messages, /weather - show weather in your location (Not yet added.)";
        messageObject.address = "COMMANDS";
        return messageObject;
    } else if (messageObject.message.includes("/admin")) {
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

server.listen(port, () => {
    console.log("Server listening on port " + port);
});
