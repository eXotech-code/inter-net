// use only newest syntax
'use strict';

// document elements for user input and output of messages
const elements = {
	inputBox: document.querySelector('[data-input-box]'),
	messageBox: document.querySelector('[data-message-box]'),
};

// incoming and outgoing message handling logic
const messageHandler = {
	messages: [],
	receive: (message) => {
		messageHandler.messages.push(message);
	},
	send: (message, username) => {
		const messageObject = {
			message: message,
			username: username,
		};
		if (!messageObject.address) {
			messageObject.username = 'ANNONYMOUS';
		}
		socket.emit('chat message', messageObject);
	},
};
// object with various methods of cookie manipulation
const cookie = {
	create: (name, value) => {
		const getExpirationDate = () => {
			var expirationDate = new Date();
			expirationDate.setDate(expirationDate.getDate() + 1);
			expirationDate = expirationDate.toUTCString();
			return expirationDate;
		};
		document.cookie = `${name}=${value}; expires=${getExpirationDate()}; samesite=strict`;
	},
};

const renderer = {
	// function that renders the whole array of messages to the messageBox
	go: () => {
		this.messages = messageHandler.messages;
		/*  initialize a string to be rendered
            to message box as multiple paragraphs */
		let renderString = '';
		for (let i = 0; i < messages.length; i++) {
			// get individual message from array
			let message = messages[i].message;
			// same but for address
			let address = messages[i].address;
			// add a new paragraph with an individual message inside
			renderString += `<p class="message">${address} : ${message}</p>`;
		}
		// render the string
		elements.messageBox.innerHTML = renderString;
		// scroll to the bottom
		elements.messageBox.scrollTop = elements.messageBox.scrollHeight;
	},
	clear: () => {
		elements.inputBox.value = '';
	},
};

const socket = io();
socket.on('chat message', (message) => {
	console.log(message);
	console.log(messageHandler.messages);
	messageHandler.receive(message);
	// start the render
	renderer.go();
});
socket.on('array update', (message) => {
	console.log(message);
});
elements.inputBox.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		messageHandler.send(
			elements.inputBox.value,
			document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, '$1')
		);
		renderer.clear();
	}
});
