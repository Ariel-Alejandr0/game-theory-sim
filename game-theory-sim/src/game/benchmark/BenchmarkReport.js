export default class BenchmarkReport {
    static generate(results) {
        return {
            totalRuns: results.length,

            averageTime:
                results.reduce(
                    (sum, r) => sum + r.executionTimeMs,
                    0
                ) / results.length,

            averageExpandedNodes:
                results.reduce(
                    (sum, r) => sum + r.expandedNodes,
                    0
                ) / results.length,

            successRate:
                results.filter(r => r.success).length /
                results.length,
        };
    }
}