import BenchmarkRunner from "./BenchmarkRunner.js";
import BenchmarkSuite from "./BenchmarkSuite.js";

const suite = new BenchmarkSuite({
    maps: [
        "./board8.txt",
        "./board80.txt",
        "./board800.txt"
    ],

    players: [
        "Copycat",
        "Defector"
    ],

    algorithms: [
        "basic",
        "cached"
    ],

    repetitions: 10
});

const results = await suite.run();

console.log(results);