// use only the newest syntax
"use strict";

// imports
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

// function
function appendMessage(message) {
    messages.push(message);
    console.log("Amount of messages in an array: " + messages.length);
}

// variables
var messages = [];

// serving index.html
app.use(express.static(__dirname));

// socket handling logic
io.on("connection", function(socket) {
    console.log("Client has been connected.");
    socket.on("chat message", function(message) {
        console.log("Message received: " + message);
        appendMessage(message);
        io.emit("chat message", { messagesArray: messages });
    });
    socket.on("disconnect", function() {
        console.log("Client has been disconnected.");
    });
});

http.listen(5000, function() {
    console.log("Listening on port: 5000");
});
