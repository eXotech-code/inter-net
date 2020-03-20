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
    let message = inputBox.value;
    if (message.includes('/admin')) {
        // this will later be a part of server side code
        message = 'DEV : ' + message.replace('/admin', '');
    };
    messages.push(message);
    // temporary console log
    console.log('amount of messages currently in array: ' + messages.length)
    renderMessages(messages);
}

// constants
const inputBox = document.querySelector('[data-input-box]');
const messageBox = document.querySelector('[data-message-box]');

// variables
var messages = []

// interaction
inputBox.addEventListener('change', (e) => {
    messageHandler();
});

})();