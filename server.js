// use only the newest syntax
"use strict";

// imports
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = process.env.PORT || 8080;

// function
function incomingMessageHandler(message, address) {
    // fix for null message bug
    if (!message) {
        return;
    }
    // clear command
    if (message.includes("/clear")) {
        messages = [];
        message = "cleared messages";
        address = "CLEAR";
    }
    address = address.replace("::ffff:", "");
    var messageObject = {
        message: message,
        address: address,
    };
    messageObject = commands(messageObject);
    messages.push(messageObject);
    console.log(messages);
    let Arraylength = messages.length;
    console.log("amount of messages in an array: " + Arraylength);
    // tests
    return Arraylength;
}

module.exports = incomingMessageHandler();

function commands(messageObject) {
    if (messageObject.message.includes("/help")) {
        messageObject.message = `/help - show this help screen, /clear - clear all messages,
             /weather - show weather in your location, /users - show amount of users connected,
              /link - send a hyperlink, /info - show message about every new connected user (default - false)`;
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
        messageObject.message = "amount of users currently connected: " + userCount;
        messageObject.address = "USERS";
        return messageObject;
    } else if (messageObject.message.includes("/link")) {
        let messageReplaced = messageObject.message.replace("/link", "");
        messageReplaced = messageReplaced.replace(/\s/g, "");
        if (messageReplaced) {
            messageObject.message = `<a href="${messageReplaced}" target="_blank">${messageReplaced}</a>`;
        } else {
            messageObject.address = "ERROR";
            messageObject.message = "wrong link format";
        }
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
io.on("connection", function (socket) {
    userCount++;
    console.log("Client has been connected.");
    // alert about a new user joining
    incomingMessageHandler("user connected", "USERS");
    io.emit("chat message", { messagesArray: messages });
    socket.on("chat message", function (message) {
        var address = socket.handshake.address;
        console.log("Message received from " + address + " - " + message);
        incomingMessageHandler(message, address);
        io.emit("chat message", { messagesArray: messages });
    });
    socket.on("disconnect", function () {
        userCount--;
        console.log("client has been disconnected.");
        incomingMessageHandler("user disconnected", "USERS");
        io.emit("chat message", { messagesArray: messages });
    });
});

server.listen(port, () => {
    console.log("Server listening on port " + port);
});
