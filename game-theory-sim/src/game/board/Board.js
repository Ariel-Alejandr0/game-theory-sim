import Cell from "./Cell.js";
import Player from "../Player.js";

import Copycat from "../strategies/CopyCat.js";
import Defector from "../strategies/Defector.js";
import Cooperate from "../strategies/Cooperate.js";
import Random from "../strategies/Random.js";
import Grudger from "../strategies/Grudger.js";
import Pavlov from "../strategies/Pavlov.js";

const strategiesMap = {
    Copycat,
    Defector,
    Cooperate,
    Random,
    Grudger,
    Pavlov,
};

const strategies = Object.values(strategiesMap);

class Board {
    constructor(size = 8) {
        this.size = size;
        this.grid = [];
        this.start = { row: 0, col: 0 };
        this.end = { row: size - 1, col: size - 1 };

        this.createGrid();
        this.populate();
    }

    clone() {
        return Board.fromJSON(this.serialize());
    }

    createGrid() {
        for (let i = 0; i < this.size; i++) {
            const row = [];

            for (let j = 0; j < this.size; j++) {
                row.push(new Cell(i, j));
            }

            this.grid.push(row);
        }
    }

    populate() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (i === this.start.row && j === this.start.col) {
                    continue;
                }

                const Strategy = this.randomStrategy();
                const player = new Player(new Strategy());

                this.grid[i][j].setPlayer(player);
            }
        }
    }

    randomStrategy() {
        const index = Math.floor(Math.random() * strategies.length);
        return strategies[index];
    }

    getCell(row, col) {
        if (this.isValid(row, col)) {
            return this.grid[row][col];
        }
        return null;
    }

    isValid(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    setPlayerAt(row, col, player) {
        this.grid[row][col].setPlayer(player);
    }

    getNeighbors(row, col) {
        const directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];

        const neighbors = [];

        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (this.isValid(newRow, newCol)) {
                neighbors.push(this.getCell(newRow, newCol));
            }
        }

        return neighbors;
    }

    serialize() {
        return {
            size: this.size,

            start: this.start,
            end: this.end,

            grid: this.grid.map((row) =>
                row.map((cell) => {
                    const player = cell.getPlayer();

                    return {
                        row: cell.row,
                        col: cell.col,

                        player: player
                            ? {
                                  strategy: player.strategy.constructor.name,
                              }
                            : null,
                    };
                }),
            ),
        };
    }

    static fromJSON(data) {
        const board = new Board(data.size);

        board.grid = [];

        for (let i = 0; i < data.size; i++) {
            const row = [];

            for (let j = 0; j < data.size; j++) {
                const cellData = data.grid[i][j];

                const cell = new Cell(cellData.row, cellData.col);

                if (cellData.player) {
                    const StrategyClass =
                        strategiesMap[cellData.player.strategy];

                    const player = new Player(new StrategyClass());

                    cell.setPlayer(player);
                }

                row.push(cell);
            }

            board.grid.push(row);
        }

        return board;
    }
}

export default Board;
