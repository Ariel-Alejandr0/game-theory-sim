class PayoffMatrix {

  constructor(matrix){
    this.matrix = matrix
  }

  getScore(a,b){
    return this.matrix[a + b]
  }

}

export default PayoffMatrix