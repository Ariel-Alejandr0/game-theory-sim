export default class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;

        this.g = Infinity;
        this.h = 0;
        this.f = Infinity;

        this.parent = null;
    }
}
