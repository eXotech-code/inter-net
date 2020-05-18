var server = require('../server');
var assert = require('assert');

describe('commands', function () {
	// test if help command is registered correctly
	it('Help command', function () {
		let message = '/help';
		let address = 'test';

		let messageObject = {
			message: message,
			address: address,
		};

		let expectedObject = {
			message: `/help - show this help screen, /username - set or change your username, /clear - clear all messages, /weather - show weather in your location, /users - show amount of users connected, /link - send a hyperlink, /info - show message about every new connected user (default - false), /scount - show amount of suppressed messages`,
			address: 'COMMANDS',
		};
		assert.deepStrictEqual(server.commands(messageObject), expectedObject);
	});

	// test if admin command is registered correctly
	it('Admin command', function () {
		let message = '/admin';
		let address = 'test';

		let messageObject = {
			message: message,
			address: address,
		};

		let expectedObject = {
			message: '',
			address: 'DEV',
		};
		assert.deepStrictEqual(server.commands(messageObject), expectedObject);
	});

	// test if command clears messages
	it('Clear command', function () {
		let message = '/clear';
		let address = 'test';

		let expectedOutput = [
			{
				message: 'cleared messages',
				address: 'CLEAR',
			},
		];

		assert.deepStrictEqual(server.incomingMessageHandler(message, address), expectedOutput);
	});

	// test if users command works
	it('Users command', function () {
		let message = '/users';
		let address = 'test';
		let messageObject = {
			message: message,
			address: address,
		};

		let expectedOutput = {
			message: 'amount of users currently connected: 0',
			address: 'USERS',
		};

		assert.deepStrictEqual(server.commands(messageObject), expectedOutput);
	});

	// test if link command works
	it('Empty link command', function () {
		let message = '/link';
		let address = 'test';
		let messageObject = {
			message: message,
			address: address,
		};

		let expectedOutput = {
			message: 'wrong link format',
			address: 'ERROR',
		};

		assert.deepStrictEqual(server.commands(messageObject), expectedOutput);
	});
	it('Link command with value', function () {
		let message = '/link http://www.peux.org';
		let address = 'test';
		let messageObject = {
			message: message,
			address: address,
		};

		let expectedOutput = {
			message: `<a href="http://www.peux.org" target="_blank">http://www.peux.org</a>`,
			address: 'test',
		};

		assert.deepStrictEqual(server.commands(messageObject), expectedOutput);
	});
});

describe('operations on messages', function () {
	it('Sample message', function () {
		let message = 'test';
		let address = 'test';
		let messageObject = {
			message: message,
			address: address,
		};

		let expectedOutput = [
			{
				message: 'cleared messages',
				address: 'CLEAR',
			},
			{
				message: 'test',
				address: 'test',
			},
		];

		assert.deepStrictEqual(server.incomingMessageHandler(message, address), expectedOutput);
	});
	it('Weather message', function () {
		let message = 'WEATHERtest';
		let address = 'test';
		let expectedOutput = [
			{
				message: 'cleared messages',
				address: 'CLEAR',
			},
			{
				message: 'test',
				address: 'test',
			},
			{
				message: 'test',
				address: 'WEATHER',
			},
		];
		assert.deepStrictEqual(server.incomingMessageHandler(message, address), expectedOutput);
	});
});
