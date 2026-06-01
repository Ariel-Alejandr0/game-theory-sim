export default class BenchmarkSuite {
    constructor({
        maps,
        players,
        algorithms,
        repetitions
    }) {
        this.maps = maps;
        this.players = players;
        this.algorithms = algorithms;
        this.repetitions = repetitions;
    }
}