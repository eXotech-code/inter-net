// imports
const http = require('http');

const data = JSON.stringify({
    message: 'Hello World!'
})

// server info
const options = {
    hostname: '127.0.0.1',
    port: 80,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
    console.error(error)
})

req.write(data)
req.end()