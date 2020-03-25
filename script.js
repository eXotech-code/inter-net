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
        let message = messages[i];
        // add a new paragraph with an individual message inside
        renderString += `<p class="message">${message}</p>`;
        // temporary console log
        console.log("message currently being rendered: " + message);
    }
    messageBox.innerHTML = renderString;
    clear();
}

function sendMessage() {
    message = inputBox.value;
    socket.emit("chat message", message);
    clear();
}

function receiveMessage() {
    socket.on("chat message", function(incomingMessages) {
        messages = incomingMessages.messagesArray;
        console.log("Messages array updated. Now it contains: " + messages);
    });
}

// constants
const inputBox = document.querySelector("[data-input-box]");
const messageBox = document.querySelector("[data-message-box]");

// variables
var socket = io();
var message = "";
var messages = [];

// interaction
inputBox.addEventListener("change", e => {
    sendMessage();
    receiveMessage();
    renderMessages(messages);
    // add renderMessages() later
});
