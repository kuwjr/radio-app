const express = require('express')
const app = express()
const fs = require('fs')
const Throttle = require('throttle')
const PassThrough = require('stream').PassThrough;

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

play = () => {
    const readable = fs.createReadStream('./myAudio.mp3');
    const throttleTransformable = new Throttle(128000 / 8);
        throttleTransformable
          .on('data', (chunk) => broadcast(chunk))
          .on('end', () => play());

        return readable.pipe(throttleTransformable);
}

//routes
app.get('/stream', (req, res) => {
    res.writeHead(200, {'Content-Type':'audio/mp3'})
    // audioStream = fs.createReadStream('myAudio.mp3');
    // audioStream.pipe(res)
    p = play()
    p.pipe(res)
})

app.get('/', (req, res) => {
    res.sendFile('index.html')
})

const port = 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})