class Random {

  constructor(){
    this.name = "Random"
  }

  play(history){
    return Math.random() < 0.5 ? "C" : "D"
  }

}

export default Random