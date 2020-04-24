var server = require("../server");
var assert = require("assert");

afterEach(function() { Object.keys(require.cache).forEach(function(module) { delete require.cache[module]; }); });

// test if command is registered correctly
describe("commands function", function () {
    context("feeding admin command into the function", function () {
        it("Should return value of expected object", function () {
            let message = "/admin";
            let address = "someAddress";

            var messageObject = {
                message: message,
                address: address,
            };

            var expectedObject = {
                message: "",
                address: "DEV",
            };

            assert.deepStrictEqual(server.commands(messageObject), expectedObject);
        });
    });
});

// test if command is registered correctly
describe("incoming message handler", function () {
    context("clear command", function () {
        it("Should return clear command output", function () {
            let message = "/clear";
            let address = "DEV";
            let messageObject = {
                message: message,
                address: address,
            };

            let expectedOutput = [
                {
                    address: "CLEAR",
                    message: "cleared messages",
                },
            ];

            assert.deepStrictEqual(server.incomingMessageHandler(message, address), expectedOutput);
        });
    });
    context("testing message", function () {
        it("Should return array with message object", function () {
            messages = [];
            let message = "test";
            let address = "DEV";
            let messageObject = {
                message: message,
                address: address,
            };

            let expectedOutput = [
                {
                    address: "DEV",
                    message: "test",
                },
            ];

            assert.deepStrictEqual(server.incomingMessageHandler(message, address), expectedOutput);
        });
    });
});
