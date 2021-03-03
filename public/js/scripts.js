let connected = false
const socket = io()
let game
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
    game = gameInitialState
    console.log('> Received initial state')
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
            context.fillStyle = '#000000'
            context.globalAlpha = 0.1
            context.fillRect(player.position.x, player.position.y, 1, 1)
        }

        const currentPlayer = game.players[socket.id]
        context.fillStyle = '#0090C1'
        context.globalAlpha = 1
        context.fillRect(currentPlayer.position.x, currentPlayer.position.y, 1, 1)

        requestAnimationFrame(renderGame)
    }
})

socket.on('updatePlayer', (obj) => {
    game.players[obj.playerId] = obj.newState
})

socket.on('removePlayer', (playerId) => {
    delete game.players[playerId]
})

function handleKeydown(event) {
    if (connected) {
        const playerId = socket.id;
        const player = game.players[playerId]

        if (event.which === KEY_LEFT && player.position.x - 1 >= 0) {
            player.position.x = player.position.x - 1
            socket.emit('movePlayer', 'left')
            return
        }

        if (event.which === KEY_UP && player.position.y - 1 >= 0) {
            player.position.y = player.position.y - 1
            socket.emit('movePlayer', 'up')
            return
        }

        if (event.which === KEY_RIGHT && player.position.x + 1 < game.canvasWidth) {
            player.position.x = player.position.x + 1
            socket.emit('movePlayer', 'right')
            return
        }

        if (event.which === KEY_DOWN && player.position.y + 1 < game.canvasHeight) {
            player.position.y = player.position.y + 1
            socket.emit('movePlayer', 'down')
            return
        }
    }
}

document.addEventListener('keydown', handleKeydown)
