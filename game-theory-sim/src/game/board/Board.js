import Cell from "./Cell.js"
import Player from "../Player.js"

import Copycat from "../strategies/CopyCat.js"
import Defector from "../strategies/Defector.js"
import Cooperate from "../strategies/Cooperate.js"
import Random from "../strategies/Random.js"
import Grudger from "../strategies/Grudger.js"
import Pavlov from "../strategies/Pavlov.js"

const strategies = [
  Copycat,
  Defector,
  Cooperate,
  Random,
  Grudger,
  Pavlov
]
class Board {

  constructor(size = 8){
    this.size = size
    this.grid = []
    this.start = { row: 0, col: 0 }
    this.end = { row: size - 1, col: size - 1 }

    this.createGrid()
    this.populate()
  }

  clone(){
    const newBoard = new Board(this.size)
    newBoard.grid = this.grid.map(row => [...row])
    return newBoard
  }

  createGrid(){
    for(let i = 0; i < this.size; i++){
      const row = []

      for(let j = 0; j < this.size; j++){
        row.push(new Cell(i, j))
      }

      this.grid.push(row)
    }
  }

  populate(){
    for(let i = 0; i < this.size; i++){
      for(let j = 0; j < this.size; j++){

        // NÃO coloca player na posição inicial
        if(i === this.start.row && j === this.start.col){
          continue
        }

        const Strategy = this.randomStrategy()
        const player = new Player(new Strategy())

        this.grid[i][j].setPlayer(player)
      }
    }
  }

  randomStrategy(){
    const index = Math.floor(Math.random() * strategies.length)
    return strategies[index]
  }

  getCell(row, col){
    if(this.isValid(row, col)){
      return this.grid[row][col]
    }
    return null
  }

  isValid(row, col){
    return row >= 0 && row < this.size &&
           col >= 0 && col < this.size
  }

  setPlayerAt(row, col, player){
    this.grid[row][col].setPlayer(player)
  }

  getNeighbors(row, col){
    const directions = [
      [1, 0],   // baixo
      [-1, 0],  // cima
      [0, 1],   // direita
      [0, -1]   // esquerda
    ]

    const neighbors = []

    for(const [dx, dy] of directions){
      const newRow = row + dx
      const newCol = col + dy

      if(this.isValid(newRow, newCol)){
        neighbors.push(this.getCell(newRow, newCol))
      }
    }

    return neighbors
  }

}

export default Board