class Battle {

  constructor(rounds, payoffMatrix){
    this.rounds = rounds
    this.payoffMatrix = payoffMatrix
  }

  play(playerA, playerB){

    let historyA = []
    let historyB = []

    let scoreA = 0
    let scoreB = 0

    let roundsLog = [] // 👈 histórico

    for(let i = 0; i < this.rounds; i++){

      const moveA = playerA.play(historyB)
      const moveB = playerB.play(historyA)

      const [pointsA, pointsB] = this.payoffMatrix.getScore(moveA, moveB)

      scoreA += pointsA
      scoreB += pointsB

      historyA.push(moveA)
      historyB.push(moveB)

      // 👇 salvar histórico da rodada
      roundsLog.push({
        round: i + 1,
        moveA,
        moveB,
        pointsA,
        pointsB
      })
    }

    return {
      playerA: playerA.name,
      playerB: playerB.name,
      scoreA,
      scoreB,
      winner: this.getWinner(scoreA, scoreB),
      rounds: roundsLog // 👈 novo campo
    }
  }

  getWinner(scoreA, scoreB){
    if(scoreA > scoreB) return "A"
    if(scoreB > scoreA) return "B"
    return "EMPATE"
  }

}

export default Battle