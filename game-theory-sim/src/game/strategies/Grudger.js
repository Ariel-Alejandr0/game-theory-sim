class Grudger {

  constructor(){
    this.name = "Grudger"
    this.betrayed = false
  }

  play(opponentHistory){

    // se já foi traído alguma vez → sempre trai
    if(this.betrayed){
      return "D"
    }

    // verifica se o oponente já traiu
    if(opponentHistory.includes("D")){
      this.betrayed = true
      return "D"
    }

    // caso contrário, coopera
    return "C"
  }

}

export default Grudger