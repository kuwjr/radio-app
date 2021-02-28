const express = require('express')
const app = express()
const fs = require('fs')
const Throttle = require('throttle')
const PassThrough = require('stream').PassThrough;
const { ffprobeSync } = require('@dropb/ffprobe');

var writables = [];

//establish a user
addUser = () => {
    const responseSink = PassThrough();
    writables.push(responseSink);
    return responseSink;
}

//send chunk to all connected users
broadcast = (chunk) => {
    for (const writable of writables) {
        writable.write(chunk);
    }
}

_getBitRate = (song) => {
    const bitRate = ffprobeSync(`${process.cwd()}/${song}`).format.bit_rate;
    return parseInt(bitRate);
}

play = () => {
    audioStream = fs.createReadStream(__dirname + '/myAudio.mp3');

    const bitRate = _getBitRate(__dirname + '/myAudio.mp3');

    throttleTransformable = new Throttle(bitRate / 8)
    throttleTransformable.on('data', (chunk) => {
        broadcast(chunk)
    })
    return audioStream.pipe(throttleTransformable);
}

//routes
app.get('/stream', (req, res) => {
    res.writeHead(200, {'Content-Type':'audio/mp3'})
    play().pipe(res)
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})