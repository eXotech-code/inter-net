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

// send and render messages only locally for the client
function sendLocal(localMessage, localAddress) {
    messages.push({
        message: localMessage,
        address: localAddress,
    });
    renderMessages(messages);
}

// make a cookie with needed value
function createCookie(name, value) {
    // get cookie expiration date (+1 day from now)
    function getExpirationDate() {
        var expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 1);
        expirationDate = expirationDate.toUTCString();
        return expirationDate;
    }
    document.cookie = `${name}=${value}; expires=${getExpirationDate()}; samesite=strict`;
}

// send message from client to server
function sendMessage() {
    messageObject.message = inputBox.value;
    messageObject.username = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (!messageObject.username) {
        messageObject.username = "ANONYMOUS";
    }
    let message = messageObject.message;
    var htmlRegex = RegExp("<.*>");
    if (!message.replace(/\s/g, "").length) {
        clear();
    } else if (htmlRegex.test(message)) {
        while (htmlRegex.test(message)) {
            message = message.replace(htmlRegex, "");
        }
        if (message.replace(/\s/g, "").length) {
            socket.emit("chat message", messageObject);
        }
        clear();
    } else if (message.includes("/weather")) {
        weather();
    } else if (message.includes("/admin")) {
        let testString = message.replace("/admin", "");
        if (testString) {
            if (testString.replace(/\s/g, "").length) {
                socket.emit("chat message", messageObject);
            }
        }
        clear();
    } else if (message.includes("/info")) {
        info = !info;
        //createCookie('info', info); <-- TODO: Save state of 'info' to a cookie
        // render message about 'info' flag change
        sendLocal(
            `User connected information flag has been set to ${info}. To show amount of supressed messages use /scount command`,
            "INFO"
        );
        clear();
        // command to show amount of supressed messages
    } else if (message.includes("/scount")) {
        if (!info) {
            sendLocal(`Amount of messages supressed: ${suppressedCount}`, "INFO");
        } else {
            sendLocal(
                `Command '/scount' not available, because info flag is set to ${info}.
             Use '/info' command to supress messages on every connected user.`,
                "INFO"
            );
        }
        clear();
        // username change
    } else if (message.includes("/username")) {
        let username = message.replace("/username", "");
        username = username.replace(/\s/g, "");
        if (username) {
            createCookie("username", username);
            console.log(`username changed to ${messageObject.username}`);
            sendLocal(`you changed your username to ${username}`, "USERNAME");
        } else {
            sendLocal("Username cannot be empty. Please choose something else.", "USERNAME");
        }
        clear();
    } else {
        socket.emit("chat message", messageObject);
        clear();
    }
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
        if (!info) {
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

// constants
const inputBox = document.querySelector("[data-input-box]");
const messageBox = document.querySelector("[data-message-box]");

// variables
var socket = io(); // socket.io node module for connecting to server
var messageObject = {
    message: "",
    username: "",
};
var messages = [];
var info = false; // flag that decides if user should see 'user connected messages'
var suppressedCount = 0;

// interaction
inputBox.addEventListener("change", (e) => {
    sendMessage();
});

receiveMessage();
