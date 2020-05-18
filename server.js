// use only the newest syntax
'use strict';

// imports
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = process.env.PORT || 8080;

// functions
function incomingMessageHandler(message, address) {
	// fix for null message bug
	if (!message) {
		return;
	}
	// clear command
	if (message.includes('/clear')) {
		messages = [];
		message = 'cleared messages';
		address = 'CLEAR';
		// force-refresh arrays of all connected clients
		io.emit('array update', { messagesArray: messages });
	}
	var messageObject = {
		message: message,
		address: address,
	};
	messageObject = commands(messageObject);
	messages.push(messageObject);
	// remove server-generated messages from console log if 'info' is set as an argument
	let messagesLog = JSON.parse(JSON.stringify(messages));
	if (process.argv[2] !== 'info') {
		for (var i = 0; i < messagesLog.length; i++) {
			let messageEval = messagesLog[i].message;
			if (messageEval === 'user connected' || messageEval === 'user disconnected') {
				messagesLog.splice(i, 1);
				i--;
			}
		}
	}
	//console.log(messagesLog);
	let Arraylength = messages.length;
	console.log('amount of messages in an array: ' + Arraylength);
	return messages;
}

function commands(messageObject) {
	if (messageObject.message.includes('/help')) {
		messageObject.message = `/help - show this help screen, /username - set or change your username, /clear - clear all messages, /weather - show weather in your location, /users - show amount of users connected, /link - send a hyperlink, /info - show message about every new connected user (default - false), /scount - show amount of suppressed messages`;
		messageObject.address = 'COMMANDS';
		return messageObject;
	} else if (messageObject.message.includes('/admin')) {
		messageObject.message = messageObject.message.replace('/admin', '');
		messageObject.address = 'DEV';
		return messageObject;
	} else if (messageObject.message.includes('WEATHER')) {
		messageObject.message = messageObject.message.replace('WEATHER', '');
		messageObject.address = 'WEATHER';
		return messageObject;
	} else if (messageObject.message.includes('/users')) {
		messageObject.message = 'amount of users currently connected: ' + userCount;
		messageObject.address = 'USERS';
		return messageObject;
	} else if (messageObject.message.includes('/link')) {
		let messageReplaced = messageObject.message.replace('/link', '');
		messageReplaced = messageReplaced.replace(/\s/g, '');
		if (messageReplaced) {
			messageObject.message = `<a href="${messageReplaced}" target="_blank">${messageReplaced}</a>`;
		} else {
			messageObject.address = 'ERROR';
			messageObject.message = 'wrong link format';
		}
	}
	return messageObject;
}

// variables
var messages = [];
var userCount = 0;

// serving index.html
app.use(express.static('static-files'));

// socket handling logic
io.on('connection', function (socket) {
	userCount++;
	console.log('\x1b[32m%s\x1b[0m', 'Client has been connected.');
	// alert about a new user joining
	incomingMessageHandler('user connected', 'USERS');
	io.emit('chat message', messages[messages.length - 1]);

	socket.on('chat message', function (incomingMessage) {
		var message = incomingMessage.message;
		var address = incomingMessage.username;
		console.log('Message received from ' + address + ' - ' + message);
		incomingMessageHandler(message, address);
		io.emit('chat message', messages[messages.length - 1]);
	});

	socket.on('array update', function (array) {
		console.log(array.arrayLength);
		if (array) {
			if (messages.length !== array.arrayLength - 1) {
				io.emit('array update', { messagesArray: messages });
				console.log(
					'\x1b[36m%s\x1b[0m',
					'One of the clients does not have the full message array. Updating...'
				);
			} else {
				console.log(
					'\x1b[32m%s\x1b[0m',
					'OK. Client has correct amount of messages in the array.'
				);
			}
		} else {
			io.emit('array update', { messagesArray: messages });
			console.log('The fuck?');
		}
	});

	socket.on('disconnect', function () {
		userCount--;
		console.log('\x1b[31m%s\x1b[0m', 'client has been disconnected.');
		incomingMessageHandler('user disconnected', 'USERS');
		io.emit('chat message', { messagesArray: messages });
	});
});

server.listen(port, () => {
	console.log('Server listening on port ' + port);
});

// tests setup
module.exports = { commands, incomingMessageHandler };
