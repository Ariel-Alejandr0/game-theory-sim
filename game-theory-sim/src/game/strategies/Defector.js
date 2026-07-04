class Defector {
    constructor() {
        this.name = "Defector";
        this.sprite = { x: 80, y: 0 }; // chapeuzinho preto
    }
    play(history) {
        return "D";
    }
}

export default Defector;
