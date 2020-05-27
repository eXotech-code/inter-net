// use only newest syntax
'use strict';

// document elements for user input and output of messages
const elements = {
	inputBox: document.querySelector('[data-input-box]'),
	messageBox: document.querySelector('[data-message-box]'),
};

// flag that decides if user should see 'user connected' messages
const info = {
	value: () => {
		let value = document.cookie.replace(/(?:(?:^|.*;\s*)info\s*\=\s*([^;]*).*$)|^.*$/, '$1');
		if (value == 'true') {
			return true;
		} else {
			return false;
		}
	},
	// change info flag to oposite of it's value
	change: (value) => {
		value = !value;
		cookie.create('info', value);
	},
};

// incoming and outgoing message handling logic
const messageHandler = {
	messages: [],
	receive: (message) => {
		messageHandler.messages.push(message);
	},
	/*  send an  array update request
		to check if there are any new messages
		on the server */
	arrayUpdate: (messages) => {
		socket.emit('array update', { arrayLength: messages.length });
	},
	/*  function that checks if a command has been used
		and acts accordingly */
	commands: (messageObject, messages) => {
		const message = messageObject.message;
		const messageSplit = message.split(' ');
		const currentCommand = messageSplit[0];
		switch (currentCommand) {
			// change username
			case '/username':
				const forbiddenNames = [
					'ADMIN',
					'DEV',
					'SERVER',
					'WEATHER',
					'USERNAME',
					'USERS',
					'',
					' ',
				];
				// Add all current usernames to forbiddenNames list
				for (let i = 0; i < messages.length; i++) {
					const currentUsername = messages[i].address;
					if (!forbiddenNames.includes(currentUsername)) {
						forbiddenNames.push(currentUsername);
					}
				}
				const username = messageSplit[1];
				if (username === messageObject.username) {
					renderer.sendLocal('You already have the same username.', 'USERNAME');
				} else if (forbiddenNames.includes(username)) {
					renderer.sendLocal(
						`'${username}' is either a reserved username or is used by a different user. Please use a different one.`,
						'USERNAME'
					);
				} else if (messageSplit[2]) {
					renderer.sendLocal('You cannot use spaces in usernames.', 'USERNAME');
				} else {
					cookie.create('username', messageSplit[1]);
					renderer.sendLocal(
						`You changed your username to ${document.cookie.replace(
							/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/,
							'$1'
						)}.`,
						'USERNAME'
					);
				}
				break;
			case '/info':
				info.change(info.value());
				renderer.sendLocal(`Info flag has been set to ${info.value()}`, 'INFO');
				break;
			default:
				socket.emit('chat message', messageObject);
		}
	},
	send: (message, username) => {
		const messageObject = {
			message: message,
			username: username,
		};
		if (!messageObject.username) {
			messageObject.username = 'ANNONYMOUS';
		}
		// run message through commands function
		messageHandler.commands(messageObject, messageHandler.messages);
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



// all of the message rendering logic
const renderer = {
	suppressedCount: 0,
	supress: (messages) => {
		// remove on connect messages if info flag is set to false
        if (!info.value()) {
			let suppressedArray = [];
            renderer.suppressedCount = 0;
            for (var i = 0; i < messages.length; i++) {
                let messageEval = messages[i].message;
                if (!(messageEval === "user connected" || messageEval === "user disconnected")) {
                    suppressedArray.push(messageEval);
					return suppressedArray;
                } else {
                    renderer.suppressedCount++;
                    i--;
				}
            }
            console.log(`suppressed ${suppressedCount} messages because 'info' flag is set to false`);
			return messages;
        }
	},
	// function that renders the whole array of messages to the messageBox
	go: () => {
		let messages = renderer.supress(messageHandler.messages);
		console.log(messages)
		if (!messages) {
			return;
		}
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
	// send a message to client only
	sendLocal: (localMessage, localAddress) => {
		messages.push({
			message: localMessage,
			address: localAddress,
		});
		renderer.clear();
		renderer.go();
	},
};

const socket = io();
socket.on('chat message', (message) => {
	console.log(`got a new message from ${message.address}: ${message.message}`);
	messageHandler.receive(message);
	// fire an array update request
	messageHandler.arrayUpdate(messageHandler.messages);
	// start the render
	renderer.go();
});
socket.on('array update', (messages) => {
	messageHandler.messages = messages.messagesArray;
	renderer.go();
	console.log('array update request received');
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
