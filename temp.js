function sendMessage() {
    fetch("http://127.0.0.1:5000/", {
        method: "POST",
        body: JSON.stringify({
            message: { messageContent }
        }),
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(message => {
            console.log(JSON.stringify(message));
        });
}

var messageContent = {
    user: "DEV",
    messageContent: "Hello World!"
};

sendMessage();
