class GameState {

  constructor({
    playerType = "Copycat",
    playerPos = { row: 0, col: 0 },
    board = null,
    path = [],
    battles = [],
    payoffMatrix = null
  } = {}) {

    this.playerType = playerType
    this.playerPos = playerPos

    this.board = board

    this.path = path

    this.battles = battles

    this.payoffMatrix = payoffMatrix
  }

  // =====================================
  // PLAYER
  // =====================================

  setPlayerType(type){
    this.playerType = type
  }

  setPlayerPosition(row, col){
    this.playerPos = { row, col }
  }

  // =====================================
  // BOARD
  // =====================================

  setBoard(board){
    this.board = board
  }

  // =====================================
  // PATH
  // =====================================

  setPath(path){
    this.path = path
  }

  clearPath(){
    this.path = []
  }

  // =====================================
  // BATTLES
  // =====================================

  addBattle(battleResult){
    this.battles.push(battleResult)
  }

  clearBattles(){
    this.battles = []
  }

  // =====================================
  // PAYOFF MATRIX
  // =====================================

  setPayoffMatrix(matrix){
    this.payoffMatrix = matrix
  }

  // =====================================
  // SERIALIZE
  // =====================================

  serialize(){

    return {
      playerType: this.playerType,

      playerPos: this.playerPos,

      board: this.board
        ? this.board.serialize()
        : null,

      path: this.path,

      battles: this.battles,

      payoffMatrix: this.payoffMatrix
        ? this.payoffMatrix.matrix
        : null
    }
  }

  // =====================================
  // RESTORE
  // =====================================

  static fromJSON(data, BoardClass, PayoffMatrixClass){

    const state = new GameState()

    state.playerType = data.playerType

    state.playerPos = data.playerPos

    state.path = data.path || []

    state.battles = data.battles || []

    if(data.board){
      state.board = BoardClass.fromJSON(data.board)
    }

    if(data.payoffMatrix){
      state.payoffMatrix =
        new PayoffMatrixClass(data.payoffMatrix)
    }

    return state
  }
}

export default GameState