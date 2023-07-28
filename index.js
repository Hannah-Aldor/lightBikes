import axios from 'axios';
const id = process.argv[2] || null;

async function fetchGames() {
    try {
      const response = await axios.get('http://light-bikes.inseng.net/games');
      return response.data;
    } catch (error) {
      console.error("FETCH_GAMES_ERR:", error);
      return error;
    }
}
async function createGame(config) {
    let { addServerBot, boardSize, numPlayers, serverBotDifficulty } = config;

    try {
      const response = await axios.post(`http://light-bikes.inseng.net/games?addServerBot=${addServerBot}&boardSize=${boardSize}&numPlayers=${numPlayers}&serverBotDifficulty=${serverBotDifficulty}`);
      console.log(response.data);
      return response.data.id;
    } catch (error) {
      console.error("CREATE_GAMES_ERR", error);
      return error;
    }
}

async function joinGame(id) {
    try {
        const response = await axios.post(`http://light-bikes.inseng.net/games/${id}/join?name=hannerz`);
        return response.data;
      } catch (error) {
        console.error("SHOW_ERR", error);
        console.error("Bad ID: %i", id);
        return error;
      }
}

async function show(id) {
    try {
      const response = await axios.get(`http://light-bikes.inseng.net/games/${id}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("SHOW_ERR", error);
      console.error("Bad ID: %i", id);
      return error;
    }
}

async function move(gameId, playerId, x, y) {
    try {
      const response = await axios.post(`http://light-bikes.inseng.net/games/${gameId}/move?playerId=${playerId}&x=${x}&y=${y}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("SHOW_ERR", error);
      console.error("Bad ID: %i", id);
      return error;
    }
}

function getGame(games, id) {
    for (let game of games) {
        if (game.id == id) { return game }
    }
    return null;
}

function getAdjacentPositions(x, y) {
    // Define possible moves: up, down, left, right
    const moves = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    const positions = [];

    moves.forEach(([dx, dy]) => {
        positions.push([x + dx, y + dy]);
    });

    return positions;
}

async function startAndClearInterval(id) {

    let intervalID = setInterval(async () => {
        try {
            let { games } = await show(id);
            const game = getGame(games, id);
            if (game.winner) clearInterval(intervalID);
            const board = game.board;
            const curr_player = game.current_player;
            // console.log("ALL PLAYERS: %o", game.players);
            const adversary = game.players[0].name === 'hannerz' ? game.players[1] : game.players[0];
            const me = game.players[0] === adversary ? game.players[1] : game.players[0];
            // console.log("ADVERSARY: %o", adversary);
            console.log("ME: %o", me);
            console.log("BOARD: %o", board);
            const boardDim = board.length;
            const curr_pos = {x: me.x, y: me.y};
            let next_pos = {x: me.x, y: me.y};
            console.log("CURRENT POSITION: %o", curr_pos);
            console.log(board);
            if (curr_player.name === 'hannerz') {
                let next_x = curr_player.x;
                let next_y = curr_player.y;
                const positions = getAdjacentPositions(next_x, next_y);
                for (const [new_x, new_y] of positions) {
                    console.log("x, y:",[new_x, new_y])
                    if (new_x < 0 || new_y < 0 || new_x > boardDim - 1 || new_y > boardDim - 1) continue;
                    if (board[new_x][new_y] != null) continue;
                    
                    next_x = new_x;
                    next_y = new_y;
                    break;
                }
                console.log("Chose [%i, %i]", next_x, next_y);
                const res = await move(id, game.current_player.id, next_x, next_y);
            }
        }
        catch(err) {
            clearInterval(intervalID);
        }

    }, 100);
  
    // Stop the interval after 60 seconds
    setTimeout(() => {
      clearInterval(intervalID);
    }, 2 * 60000000);
  }

async function init(id) {
    const defaultConfig = {addServerBot:true, boardSize:25, numPlayers:2, serverBotDifficulty:2}
    if (!id) id = await createGame(defaultConfig);
    await joinGame(id);
    startAndClearInterval(id);
    
}

init(id);