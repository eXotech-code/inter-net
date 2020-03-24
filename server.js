// use only the newest syntax
"use strict";

// imports
var net = require("net");
var express = require("express");
var app = express();

app.use(express.json());

var client = app.listen(3000, () => {
    console.log(
        "Client has been initialized and is running on: " +
            client.address().port
    );
});
app.use(express.static(__dirname));

app.post("/", function(request, response) {
    console.log(request.body.message);
});
