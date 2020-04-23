// use only newest syntax
"use strict";

// constants
const inputBox = document.querySelector("[data-input-box]");
const messageBox = document.querySelector("[data-message-box]");
// flag that decides if user should see 'user connected messages'
const info = () => {
    let value = document.cookie.replace(/(?:(?:^|.*;\s*)info\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (value == "true") {
        return true;
    } else {
        return false;
    }
};

// variables
var socket = io(); // socket.io node module for connecting to server
var messageObject = {
    message: "",
    username: "",
};
var messages = [];
var suppressedCount = 0;

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

// send and render messages only locally for the client
function sendLocal(localMessage, localAddress, shouldClear) {
    messages.push({
        message: localMessage,
        address: localAddress,
    });
    if (shouldClear) {
        clear();
    }
    renderMessages(messages);
}

// cookie object with needed methods
const cookie = {
    // make a cookie with needed value
    create: (name, value) => {
        // get cookie expiration date (+1 day from now)
        function getExpirationDate() {
            var expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 1);
            expirationDate = expirationDate.toUTCString();
            return expirationDate;
        }
        document.cookie = `${name}=${value}; expires=${getExpirationDate()}; samesite=strict`;
    },
};

// send message from client to server
function sendMessage() {
    messageObject.message = inputBox.value;
    messageObject.username = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (!messageObject.username) {
        messageObject.username = "ANONYMOUS";
    } else {
        // refrsh a cookie if username is already present
        cookie.create("username", messageObject.username);
    }
    let message = messageObject.message;
    var htmlRegex = RegExp("<.*>");
    // command object with various methods for accepting commands
    const command = {
        check: function (command) {
            if (message.includes("/" + command)) {
                return true;
            }
        },
        cleanInput: function (command, removeSpaces, removeCommand) {
            command = "/" + command;
            if (removeCommand) {
                command = message.replace(command, "");
            }
            if (removeSpaces) {
                command = command.replace(/\s/g, "");
            }
            return command;
        },
    };
    // function for emitting messages through the socket
    const emitMessage = () => {
        if (message.replace(/\s/g, "").length) {
            socket.emit("chat message", messageObject);
        }
    };
    if (!message.replace(/\s/g, "").length) {
        clear();
    }
    if (htmlRegex.test(message)) {
        while (htmlRegex.test(message)) {
            message = message.replace(htmlRegex, "");
        }
    }
    // commands
    if (command.check("weather")) {
        weather();
    } else if (command.check("admin")) {
        let admin = "admin";
        message = command.cleanInput(admin, true, true);
        emitMessage();
    } else if (command.check("info")) {
        let infoValue = !info();
        cookie.create("info", infoValue);
        console.log(document.cookie);
        // render message about 'info' flag change
        sendLocal(
            `User connected information flag has been set to ${info()}. To show amount of supressed messages use /scount command`,
            "INFO",
            true
        );
    } else if (command.check("scount")) {
        // command to show amount of supressed messages
        if (!info()) {
            sendLocal(`Amount of messages supressed: ${suppressedCount}`, "INFO");
        } else {
            sendLocal(
                `Command '/scount' not available, because info flag is set to ${info()}.
                 Use '/info' command to supress messages on every connected user.`,
                "INFO",
                true
            );
        }
    } else if (command.check("username")) {
        // username change
        let username = "username";
        username = command.cleanInput(username, true, true);
        if (username) {
            cookie.create("username", username);
            console.log(`username changed to ${messageObject.username}`);
            sendLocal(`you changed your username to ${username}`, "USERNAME");
        } else {
            sendLocal("Username cannot be empty. Please choose something else.", "USERNAME", true);
        }
    } else {
        emitMessage();
    }
    clear();
}

function weather() {
    let longitude;
    let latitude;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            longitude = position.coords.longitude;
            latitude = position.coords.latitude;
            // proxy for development purposes
            const proxy = "https://cors-anywhere.herokuapp.com/";
            // API address to DarkSky servers
            const api = `${proxy}https://api.darksky.net/forecast/98b6df8c5521254b48809cb362a4dafc/${latitude},${longitude}`;
            // get weather information from DarkSky servers
            fetch(api)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    const { temperature, summary } = data.currently;
                    // temperature convertion formula
                    let temperatureCelcius = Math.floor((temperature - 32) * (5 / 9));
                    // prettier-ignore
                    var messageObject = {
                        message: "WEATHERIn " + data.timezone + " it is " + temperatureCelcius + "°C with " + summary.toLowerCase() + ".",
                        username: document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                    }
                    // temporary fix for a bug
                    if (messageObject.message) {
                        socket.emit("chat message", messageObject);
                        clear();
                        console.log("weather command activated.");
                    } else {
                        alert("ERROR: could not connect to server.");
                    }
                });
        });
    }
}

// get array with sent messages from the server
function receiveMessage() {
    socket.on("chat message", function (incomingMessages) {
        messages = incomingMessages.messagesArray;
        // remove on connect messages if info flag is set to false
        if (!info()) {
            suppressedCount = 0;
            for (var i = 0; i < messages.length; i++) {
                let messageEval = messages[i].message;
                if (messageEval === "user connected" || messageEval === "user disconnected") {
                    messages.splice(i, 1);
                    suppressedCount++;
                    i--;
                }
            }
            console.log(`suppressed ${suppressedCount} messages because 'info' flag is set to false`);
        }
        console.log("Messages array updated. Now it contains " + messages.length + " messages.");
        renderMessages(messages);
    });
}

// interaction
inputBox.addEventListener("change", (e) => {
    sendMessage();
});

receiveMessage();
