export default class BenchmarkCase {
    constructor({
        mapFile,
        playerType,
        algorithm
    }) {
        this.mapFile = mapFile;
        this.playerType = playerType;
        this.algorithm = algorithm;
    }
}