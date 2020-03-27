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
            "/help - show this help screen, /clear - clear all messages, /weather - show weather in your location, /users - show amount of users connected";
        messageObject.address = "COMMANDS";
        return messageObject;
    } else if (messageObject.message.includes("/admin")) {
        messageObject.message = messageObject.message.replace("/admin", "");
        messageObject.address = "DEV";
        return messageObject;
    } else if (messageObject.message.includes("WEATHER")) {
        messageObject.message = messageObject.message.replace("WEATHER", "");
        messageObject.address = "WEATHER";
        return messageObject;
    } else if (messageObject.message.includes("/users")) {
        messageObject.message = "Amount of users currently connected: " + userCount;
        messageObject.address = "USERS";
        return messageObject;
    } else {
        return messageObject;
    }
}

// variables
var messages = [];
var userCount = 0;

// serving index.html
app.use(express.static("static-files"));

// socket handling logic
io.on("connection", function(socket) {
    userCount++;
    console.log("Client has been connected.");
    // alert about a new user joining
    incomingMessageHandler("New user connected", "USERS");
    socket.on("chat message", function(message) {
        var address = socket.handshake.address;
        console.log("Message received from " + address + " - " + message);
        incomingMessageHandler(message, address);
        io.emit("chat message", { messagesArray: messages });
    });
    socket.on("disconnect", function() {
        userCount--;
        console.log("Client has been disconnected.");
        incomingMessageHandler("User disconnected", "USERS");
    });
});

server.listen(port, () => {
    console.log("Server listening on port " + port);
});
