class Player {

  constructor(strategy){
    this.strategy = strategy
    this.name = strategy.constructor.name
  }

  play(opponentHistory){
    return this.strategy.play(opponentHistory)
  }

}

export default Player