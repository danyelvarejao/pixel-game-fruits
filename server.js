const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
const PORT = 8000;

const game = createGame()

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
    const playerId = socket.id;
    const playerState = game.addPlayer(playerId)
    
    socket.emit('connectPlayer', game)
    
    socket.broadcast.emit('updatePlayer', {
        playerId: playerId,
        newState: playerState
    })
    
    socket.on('disconnect', () => {
        game.removePlayer(playerId)
        socket.broadcast.emit('removePlayer', playerId)
    })
    
    socket.on('movePlayer', (direction) => {
        game.movePlayer(playerId, direction)
        socket.broadcast.emit('updatePlayer', {
            playerId: playerId,
            newState: game.players[playerId]
        })
    })
});

server.listen(PORT, function() {
    console.log(`> Server listening on port: ${PORT}`)
});

function createGame() {
    console.log('> Starting new game')
    
    const game = {
        canvasWidth: 35,
        canvasHeight: 30,
        players: {},
        addPlayer,
        removePlayer,
        movePlayer
    }
    
    function addPlayer(playerId) {
        return game.players[playerId] = {
            position: {
                x: Math.floor(Math.random() * game.canvasWidth),
                y: Math.floor(Math.random() * game.canvasHeight),
            }
        }
    }
    
    function removePlayer(playerId) {
        delete game.players[playerId]
    }
    
    function movePlayer(playerId, direction) {
        const player = game.players[playerId]
        
        if (direction === 'left' && player.position.x - 1 >= 0) {
            player.position.x = player.position.x - 1
        }
        
        if (direction === 'up' && player.position.y - 1 >= 0) {
            player.position.y = player.position.y - 1
        }
        
        if (direction === 'right' && player.position.x + 1 < game.canvasWidth) {
            player.position.x = player.position.x + 1
        }
        
        if (direction === 'down' && player.position.y + 1 < game.canvasHeight) {
            player.position.y = player.position.y + 1
        }
        
        return player
    }
    return game
}