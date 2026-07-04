class Copycat {

  constructor(){
    this.name = "CopyCat"
    this.sprite = { x: 0, y: 0 }    // chapéu azul claro boné

  }
  play(history){
    if(history.length === 0) return "C"
    return history[history.length - 1]
  }

}

export default Copycat