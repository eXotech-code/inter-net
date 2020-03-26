// use only newest syntax
"use strict";

// functions
function clear() {
    inputBox.value = "";
}

// render array of messages to the messageBox
function renderMessages(messages) {
    /*  initialize a string to be rendered
        to message box as multiple paragraphs */
    let renderString = "";
    // add every message from array of messages to renderString
    for (let i = 0; i < messages.length; i++) {
        let message = messages[i].message;
        // get ip address of the connected user
        let address = messages[i].address;
        // add a new paragraph with an individual message inside
        renderString += `<p class="message">${address} : ${message}</p>`;
        // temporary console log
        console.log("message currently being rendered: " + message);
    }
    messageBox.innerHTML = renderString;
    messageBox.scrollTop = messageBox.scrollHeight;
}

// send message from client to server
function sendMessage() {
    message = inputBox.value;
    htmlRegex = RegExp("<.*>");
    if (!message.replace(/\s/g, "").length) {
        clear();
    } else if (htmlRegex.test(message)) {
        clear();
    } else {
        socket.emit("chat message", message);
        clear();
    }
}

// get array with sent messages from the server
function receiveMessage() {
    socket.on("chat message", function(incomingMessages) {
        messages = incomingMessages.messagesArray;
        console.log("Messages array updated. Now it contains " + messages.length + " messages.");
        renderMessages(messages);
    });
}

// constants
const inputBox = document.querySelector("[data-input-box]");
const messageBox = document.querySelector("[data-message-box]");

// variables
var socket = io(); // socket.io node module for connecting to server
var message = "";
var messages = [];

// interaction
inputBox.addEventListener("change", e => {
    sendMessage();
});

receiveMessage();
