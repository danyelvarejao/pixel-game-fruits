const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

const PORT = 8000;

const COLISION_NONE = 0
const COLISION_BLOCKSOLID = 1
const COLISION_FRUIT = 2

const game = createGame()

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
    const playerId = socket.id;
    const playerState = game.addPlayer(playerId)
    
    socket.emit('connectPlayer', game)
    
    socket.emit('updatePlayer', {
        playerId: playerId,
        newState: playerState
    })
    
    socket.on('disconnect', () => {
        game.removePlayer(playerId)
        
        socket.emit('removePlayer', playerId)
    })
    
    socket.on('movePlayer', (direction) => {
        const colision = game.movePlayer(playerId, direction)
        if (colision !== COLISION_BLOCKSOLID) {
            socket.emit('updatePlayer', {
                playerId: playerId,
                newState: game.players[playerId]
            })
        }

        if (colision === COLISION_FRUIT) {
            socket.emit('updateFruitPosition', game.fruitPosition)
        }
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
        fruitPosition: null,

        addPlayer,
        removePlayer,
        movePlayer,
    }
    
    createFruit()

    function addPlayer(playerId) {
        return game.players[playerId] = {
            obtainedFruits: 0,
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
        const oldPosition = player.position
        const newPosition = getNextPositionByDirection({ ...oldPosition }, direction)
        const colision = checkColision(newPosition)
        if (colision !== COLISION_BLOCKSOLID) {
            player.position = newPosition
        }

        if (colision === COLISION_FRUIT) {
            player.obtainedFruits++;
            createFruit()
        }
        return colision
    }

    function getNextPositionByDirection(position, direction) {
        if (direction === 'left') {
            position.x = position.x - 1
        }
        
        if (direction === 'up') {
            position.y = position.y - 1
        }
        
        if (direction === 'right') {
            position.x = position.x + 1
        }
        
        if (direction === 'down') {
            position.y = position.y + 1
        }
        return position
    }

    function checkColision(position) {
        const fruitPosition = game.fruitPosition;
        if (position.x === fruitPosition.x && position.y === fruitPosition.y) {
            return COLISION_FRUIT
        }
        
        if(position.x < 0 || position.x >= game.canvasWidth || position.y < 0 || position.y >= game.canvasHeight) {
            return COLISION_BLOCKSOLID
        }

        for(const playerId in game.players) {
            const player = game.players[playerId]
            const playerPosition = player.position;
            if (position.x === playerPosition.x && position.y === playerPosition.y) {
                return COLISION_BLOCKSOLID
            }
        }
        return COLISION_NONE
    }

    function createFruit() {
        const fruitPosition = {
            x: Math.floor(Math.random() * game.canvasWidth),
            y: Math.floor(Math.random() * game.canvasHeight)
        }

        game.fruitPosition = fruitPosition
    }
    return game
}