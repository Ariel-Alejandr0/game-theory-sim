// testBenchmark.js

import BenchmarkRunner from "./BenchmarkRunner.js"

const result = BenchmarkRunner.run({
    mapFile: "./board800.txt",

    playerStrategy: "Copycat",

    algorithm: "cached",
});

console.log(result);