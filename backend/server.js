const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)

const PORT = 8000;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})

server.listen(PORT, function(){
    console.log(`> Server listening on port: ${PORT}`)
});