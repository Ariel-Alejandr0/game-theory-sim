export default class BenchmarkReport {
    constructor(results) {
        this.results = results;
    }
    averageExecutionTime() {
        const total = this.results.reduce(
            (sum, r) => sum + r.executionTimeMs,
            0,
        );

        return total / this.results.length;
    }
    successRate() {
        const successes = this.results.filter((r) => r.success).length;

        return successes / this.results.length;
    }
}
