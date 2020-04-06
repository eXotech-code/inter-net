var server = require("../server");
var assert = require("assert");

describe("#incomingMessageHandler()", function () {
    context("two messages", function () {
        it("Should return 2", function () {
            assert.ok(server.incomingMessageHandler("test", "127.0.0.1"), undefined);
        });
    });
});
