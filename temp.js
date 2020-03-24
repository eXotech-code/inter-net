function sendMessage() {
    fetch("http://127.0.0.1:3000/", {
        method: "POST",
        body: JSON.stringify({
            message: {
                user: "DEV",
                messageContent: "hi"
            }
        }),
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(message => {
            console.log(JSON.stringify(message));
        });
}

sendMessage();
