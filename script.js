// use only newest syntax
(function(){"use strict";

// functions
function clear() {
    inputBox.value = '';
};

// render array of messages to the messageBox
function renderMessages(messages) {
    /*  initialize a string to be rendered
        to message box as multiple paragraphs */
    let renderString = ''
    // add every message from array of messages to renderString
    for (let i = 0; i < messages.length; i++) {
        let message = messages[i]
        // add a new paragraph with an individual message inside
        renderString += `<p class="message">${message}</p>`;
        // temporary console log
        console.log('message currently being rendered: ' + message)
    };
    messageBox.innerHTML = renderString;
    clear();
};

// get the message from input box and add it to array
function messageHandler() {
    message = inputBox.value;
    // commands
    if (message.includes('/help')) {
        // this will later be a part of server side code
        message = 'COMMANDS : /help - show this help screen, /weather - show weather in your location';
    } else if (message.includes('/weather')) {
        message = ''
        weather(message);
    } else if (message.includes('/admin')) {
        // this will later be a part of server side code
        message = 'DEV : ' + message.replace('/admin', '');
    } else {
        message = 'USER-ID : ' + message;   // to be replaced by server side generated user ID
    };
    // check if string contains stuff before adding it
    if (message) {
        messages.push(message);
        // temporary console log
        console.log('amount of messages currently in array: ' + messages.length);
        renderMessages(messages);
    };
}

// get weather information using DarkSky api
function weather(message) {
    let longitude;
    let latitude;

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            longitude = position.coords.longitude;
            latitude = position.coords.latitude;
            // proxy for development purposes
            const proxy = 'https://cors-anywhere.herokuapp.com/';
            // API address to DarkSky servers
            const api = `${proxy}https://api.darksky.net/forecast/98b6df8c5521254b48809cb362a4dafc/${latitude},${longitude}`;
            // get weather information from DarkSky servers
            fetch(api)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    const {temperature, summary} = data.currently;
                    message = 'WEATHER : In ' + data.timezone + ' it is ' + temperature + ' degrees in fahrenheit with ' + summary + '.';
                    // temporary fix for a bug
                    if (message) {
                        messages.push(message);
                        // temporary console log
                        console.log('amount of messages currently in array: ' + messages.length);
                        renderMessages(messages);
                    };
                });
        });
    };
};

// constants
const inputBox = document.querySelector('[data-input-box]');
const messageBox = document.querySelector('[data-message-box]');

// variables
var message = '';
var messages = [];

// interaction
inputBox.addEventListener('change', (e) => {
    messageHandler();
});

})();