var server = require("../server");
var assert = require("assert");

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
