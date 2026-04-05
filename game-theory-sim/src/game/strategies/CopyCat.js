class Copycat {

  constructor(){
    this.name = "CopyCat"
  }
  play(history){
    if(history.length === 0) return "C"
    return history[history.length - 1]
  }

}

export default Copycat