import BenchmarkSuite from "./BenchmarkSuite.js";
import { saveSuiteResults } from "../../service/BenchmarkService.js";

const suite = new BenchmarkSuite({
  maps: [
    "./board8.txt",
    "./board80.txt",
    "./board800.txt"
  ],
  players: [
    "Copycat",
    // "Defector",
    // "Cooperate",
    // "Grudger",
    // "Pavlov",
    // "Random",
  ],
  algorithms: [
    "basic",
    "cached"
  ],
  repetitions: 10
});

const results = await suite.run();

const session = await saveSuiteResults(results, {
  repetitions: suite.repetitions,
  sourceFile: "testeSuite.js",
});

console.log(`Sessão #${session.id} salva com ${results.length} runs.`);