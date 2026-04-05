class Pavlov {

  constructor(){
    this.name = "Pavlov"
    this.lastMove = "C" // começa cooperando
  }

  play(opponentHistory){

    // primeira rodada
    if(opponentHistory.length === 0){
      this.lastMove = "C"
      return "C"
    }

    const lastOpponentMove = opponentHistory[opponentHistory.length - 1]

    // condição de "sucesso"
    const success =
      (this.lastMove === "C" && lastOpponentMove === "C") ||
      (this.lastMove === "D" && lastOpponentMove === "C")

    if(success){
      // mantém jogada
      return this.lastMove
    } else {
      // troca jogada
      this.lastMove = this.lastMove === "C" ? "D" : "C"
      return this.lastMove
    }
  }

}

export default Pavlov