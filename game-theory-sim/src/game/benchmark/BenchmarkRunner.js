import fs from "fs";

import Board from "../board/Board.js"
import Player from "../Player.js";
import Battle from "../battle/Battle.js";

import AStar from "../pathFinding/AStar.js"

import Cooperate from "../strategies/Cooperate.js";
import Defector from "../strategies/Defector.js";
import Copycat from "../strategies/CopyCat.js";
import Grudger from "../strategies/Grudger.js";
import Pavlov from "../strategies/Pavlov.js";
import Random from "../strategies/Random.js";

const strategyFactory = {
    Cooperate: () => new Cooperate(),
    Defector: () => new Defector(),
    Copycat: () => new Copycat(),
    Grudger: () => new Grudger(),
    Pavlov: () => new Pavlov(),
    Random: () => new Random(),
};

function loadBoard(filePath) {
    const json = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    return Board.deserialize(json);
}

export default class BenchmarkRunner {
    static run({
        mapFile,
        playerStrategy,
        algorithm,
    }) {
        const boardData = JSON.parse(
            fs.readFileSync(mapFile, "utf8")
        );

        const board = Board.fromJSON(boardData);

        const player = new Player(
            strategyFactory[playerStrategy]()
        );

        const astar = new AStar(
            board,
            player,
            () => new Battle()
        );

        const start = boardData.start;
        const end = boardData.end;

        const t0 = performance.now();

        const result =
            algorithm === "cached"
                ? astar.findCached(start, end)
                : astar.findBasic(start, end);

        const t1 = performance.now();

        return {
            algorithm,

            map: mapFile,

            player: playerStrategy,

            success: result.metrics.reachedGoal,

            executionTimeMs: t1 - t0,

            pathLength: result.path.length,

            testedBattles:
                result.metrics.testedBattles,

            successfulBattles:
                result.metrics.successfulBattles,

            expandedNodes:
                result.metrics.expandedNodes,

            cacheHits:
                result.metrics.cacheHits,

            cacheMisses:
                result.metrics.cacheMisses,
        };
    }
}