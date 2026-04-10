class Cell {

  constructor(row, col, player = null){
    this.row = row
    this.col = col
    this.player = player
  }

  setPlayer(player){
    this.player = player
  }

  getPlayer(){
    return this.player
  }

  hasPlayer(){
    return this.player !== null
  }

  getPosition(){
    return {
      row: this.row,
      col: this.col
    }
  }

  battle(opponentPlayer, battleInstance){
    if(!this.player) return null

    return battleInstance.play(this.player, opponentPlayer)
  }

}

export default Cell