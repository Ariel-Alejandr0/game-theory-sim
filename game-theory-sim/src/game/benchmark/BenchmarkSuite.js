import BenchmarkRunner from "./BenchmarkRunner.js";

export default class BenchmarkSuite {
    constructor({ maps, players, algorithms, repetitions }) {
        this.maps = maps;
        this.players = players;
        this.algorithms = algorithms;
        this.repetitions = repetitions;
    }
    async run() {
        const results = [];

        for (const map of this.maps) {
            for (const player of this.players) {
                for (const algorithm of this.algorithms) {
                    for (let i = 0; i < this.repetitions; i++) {
                        const result = BenchmarkRunner.run({
                            mapFile: map,
                            playerStrategy: player,
                            algorithm,
                        });

                        results.push(result);
                    }
                }
            }
        }

        return results;
    }
}
