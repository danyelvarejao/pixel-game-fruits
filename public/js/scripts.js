let connected = false
let game

const socket = io()
const gameCanvas = document.getElementById('gameCanvas')

const KEY_LEFT = 37
const KEY_RIGHT = 39
const KEY_UP = 38
const KEY_DOWN = 40

socket.on('connect', () => {
    connected = true
    console.log('> Connected to server')
})

socket.on('disconnect', () => {
    connected = false
    console.log('> Disconnected from server')
})

socket.on('connectPlayer', (gameInitialState) => {
    console.log('> Received initial state')
    game = gameInitialState
    gameCanvas.style.width = `${game.canvasWidth * 30}px`
    gameCanvas.style.height = `${game.canvasHeight * 30}px`
    gameCanvas.width = game.canvasWidth
    gameCanvas.height = game.canvasHeight

    const context = gameCanvas.getContext('2d')

    requestAnimationFrame(renderGame)

    function renderGame() {
        context.globalAlpha = 1
        context.fillStyle = '#022f40'
        context.fillRect(0, 0, game.canvasWidth, game.canvasHeight)

        for (const playerId in game.players) {
            const player = game.players[playerId]
            context.fillStyle = 'white'
            context.globalAlpha = 1
            context.fillRect(player.position.x, player.position.y, 1, 1)
        }

        const currentPlayer = game.players[socket.id]
        context.fillStyle = 'black'
        context.globalAlpha = 1
        context.fillRect(currentPlayer.position.x, currentPlayer.position.y, 1, 1)

        const fruitPosition = game.fruitPosition
        context.fillStyle = 'red'
        context.globalAlpha = 1
        context.fillRect(fruitPosition.x, fruitPosition.y, 1, 1)

        requestAnimationFrame(renderGame)
    }
})

socket.on('updateFruitPosition', (position) => {
    game.fruitPosition = position
})

socket.on('updatePlayer', (obj) => {
    game.players[obj.playerId] = obj.newState
})

socket.on('removePlayer', (playerId) => {
    delete game.players[playerId]
})

function handleKeydown(event) {
    if (connected) {
        if (event.which === KEY_LEFT) {
            socket.emit('movePlayer', 'left')
            return
        }

        if (event.which === KEY_UP) {
            socket.emit('movePlayer', 'up')
            return
        }

        if (event.which === KEY_RIGHT) {
            socket.emit('movePlayer', 'right')
            return
        }

        if (event.which === KEY_DOWN) {
            socket.emit('movePlayer', 'down')
            return
        }
    }
}

document.addEventListener('keydown', handleKeydown)
