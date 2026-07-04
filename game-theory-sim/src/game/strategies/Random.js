class Random {

  constructor(){
    this.name = "Random"
    this.sprite = { x: 400, y: 0 }    // chapéu de palhaço
  }

  play(history){
    return Math.random() < 0.5 ? "C" : "D"
  }

}

export default Random