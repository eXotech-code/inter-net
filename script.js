// use only newest syntax
(function(){"use strict";

// functions
function renderMessage() {
    let message = inputBox.value
    messageBox.innerHTML = `<p class="message">${message}</p>`
};

function clear() {
    inputBox.value = ''
};

// constants
const inputBox = document.querySelector('[data-input-box]');
const messageBox = document.querySelector('[data-message-box]');

// interaction
inputBox.addEventListener('change', (e) => {
    renderMessage();
    clear();
});

})();