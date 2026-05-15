// game/pathFinding/AStar.js

import matchupCost from "./PreComputedMatrix";
import Node from "./Node";
export default class AStar {
    constructor(board, player, createBattle) {
        this.board = board;

        this.player = player;

        this.createBattle = createBattle;

        // 🔥 histórico COMPLETO de testes
        this.testedBattles = [];

        // 🔥 cache para impedir batalhas inconsistentes
        this.battleCache = {};
    }

    heuristic(a, b) {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    }

    reconstructPath(node) {
        const path = [];

        let current = node;

        while (current) {
            path.unshift({
                row: current.row,
                col: current.col,
            });

            current = current.parent;
        }

        return path;
    }

    // =========================================
    // 🔥 batalha REAL + cache + histórico
    // =========================================

    evaluateBattle(cell) {
        const { row, col } = cell;

        const cacheKey = `${row}-${col}`;

        // casa vazia
        const enemy = cell.getPlayer();

        if (!enemy) {
            return {
                allowed: true,
                cost: 1,
                result: null,
            };
        }

        // =====================================
        // cache
        // =====================================

        if (this.battleCache[cacheKey]) {
            return this.battleCache[cacheKey];
        }

        // =====================================
        // batalha REAL
        // =====================================

        const battle = this.createBattle();

        const result = battle.play(this.player, enemy);

        let battleData;

        // derrota = bloqueado
        if (result.winner === "B") {
            battleData = {
                allowed: false,
                cost: Infinity,
                result,
            };
        }

        // vitória
        else if (result.winner === "A") {
            battleData = {
                allowed: true,
                cost: 2,
                result,
            };
        }

        // empate
        else {
            battleData = {
                allowed: true,
                cost: 5,
                result,
            };
        }

        // =====================================
        // salva cache
        // =====================================

        this.battleCache[cacheKey] = battleData;

        // =====================================
        // salva histórico COMPLETO
        // =====================================

        this.testedBattles.push({
            position: {
                row,
                col,
            },

            playerA: result.playerA,
            playerB: result.playerB,

            scoreA: result.scoreA,
            scoreB: result.scoreB,

            winner: result.winner,

            rounds: result.rounds,
        });

        return battleData;
    }

    // =========================================
    // 🔥 A* inteligente
    // =========================================

    findCached(start, end) {
        const open = [];
        const closed = [];
        const nodes = {};

        const testedBattles = [];
        const successfulBattles = [];

        // 🔥 cache
        const battleCache = {};

        const key = (r, c) => `${r}-${c}`;

        const startNode = new Node(start.row, start.col);

        startNode.g = 0;
        startNode.h = this.heuristic(start, end);
        startNode.f = startNode.h;

        let bestNode = startNode;

        open.push(startNode);

        nodes[key(start.row, start.col)] = startNode;

        while (open.length > 0) {
            open.sort((a, b) => a.f - b.f);

            const current = open.shift();

            if (current.h <= bestNode.h) {
                bestNode = current;
            }

            if (current.row === end.row && current.col === end.col) {
                return {
                    path: this.reconstructPath(current),
                    testedBattles,
                    successfulBattles,
                };
            }

            closed.push(current);

            let neighbors = this.board.getNeighbors(current.row, current.col);

            neighbors.sort((a, b) => {
                const enemyA = a.getPlayer();
                const enemyB = b.getPlayer();

                const myType = this.player.strategy.name;

                const typeA = enemyA?.strategy?.name;
                const typeB = enemyB?.strategy?.name;

                const priorityA = matchupCost[myType]?.[typeA] ?? 999;

                const priorityB = matchupCost[myType]?.[typeB] ?? 999;

                return priorityA - priorityB;
            });

            for (const cell of neighbors) {
                const { row, col } = cell;

                const k = key(row, col);

                let neighbor = nodes[k];

                if (!neighbor) {
                    neighbor = new Node(row, col);
                    nodes[k] = neighbor;
                }

                if (closed.some((n) => n.row === row && n.col === col)) {
                    continue;
                }

                const enemy = cell.getPlayer();

                // =================================
                // CASA VAZIA
                // =================================

                if (!enemy) {
                    const tentativeG = current.g + 1;

                    if (tentativeG < neighbor.g) {
                        neighbor.parent = current;

                        neighbor.g = tentativeG;

                        neighbor.h = this.heuristic(neighbor, end);

                        neighbor.f = neighbor.g + neighbor.h;

                        if (!open.includes(neighbor)) {
                            open.push(neighbor);
                        }
                    }

                    continue;
                }

                // =================================
                // CACHE KEY
                // =================================

                const myType = this.player.strategy.name;

                const enemyType = enemy.strategy.name;

                const cacheKey = `${myType}-${enemyType}`;

                let result;

                // =================================
                // RANDOM NÃO USA CACHE
                // =================================

                if (enemyType !== "Random" && battleCache[cacheKey]) {
                    result = battleCache[cacheKey];
                } else {
                    // 🔥 batalha REAL
                    const battle = this.createBattle();

                    result = battle.play(this.player, enemy);

                    // salva cache
                    if (enemyType !== "Random") {
                        battleCache[cacheKey] = result;
                    }
                    // =================================
                    // salva histórico
                    // =================================

                    testedBattles.push({
                        position: { row, col },

                        playerA: result.playerA,
                        playerB: result.playerB,

                        scoreA: result.scoreA,
                        scoreB: result.scoreB,

                        winner: result.winner,

                        rounds: result.rounds,
                    });
                }

                // perdeu
                if (result.winner === "B") {
                    continue;
                }

                successfulBattles.push({
                    position: { row, col },

                    playerA: result.playerA,
                    playerB: result.playerB,

                    scoreA: result.scoreA,
                    scoreB: result.scoreB,

                    winner: result.winner,

                    rounds: result.rounds,
                });

                const cost = result.winner === "A" ? 2 : 5;

                const tentativeG = current.g + cost;

                if (tentativeG < neighbor.g) {
                    neighbor.parent = current;

                    neighbor.g = tentativeG;

                    neighbor.h = this.heuristic(neighbor, end);

                    neighbor.f = neighbor.g + neighbor.h;

                    if (!open.includes(neighbor)) {
                        open.push(neighbor);
                    }
                }
            }
        }

        return {
            path: this.reconstructPath(bestNode),
            testedBattles,
            successfulBattles,
        };
    }

    findBasic(start, end) {
        const open = [];
        const closed = [];
        const nodes = {};

        // 🔥 histórico completo
        const testedBattles = [];

        // 🔥 batalhas válidas
        const successfulBattles = [];

        const key = (r, c) => `${r}-${c}`;

        const startNode = new Node(start.row, start.col);

        startNode.g = 0;

        startNode.h = this.heuristic(start, end);

        startNode.f = startNode.h;

        let bestNode = startNode;

        open.push(startNode);

        nodes[key(start.row, start.col)] = startNode;

        while (open.length > 0) {
            // =====================================
            // A* tradicional
            // sem inteligência de matchup
            // =====================================

            open.sort((a, b) => a.f - b.f);

            const current = open.shift();

            // melhor aproximação
            if (current.h <= bestNode.h) {
                bestNode = current;
            }

            // chegou ao objetivo
            if (current.row === end.row && current.col === end.col) {
                return {
                    path: this.reconstructPath(current),

                    testedBattles,

                    successfulBattles,
                };
            }

            closed.push(current);

            // =====================================
            // vizinhos SEM sort inteligente
            // =====================================

            const neighbors = this.board.getNeighbors(current.row, current.col);

            for (const cell of neighbors) {
                const { row, col } = cell;

                const k = key(row, col);

                let neighbor = nodes[k];

                if (!neighbor) {
                    neighbor = new Node(row, col);

                    nodes[k] = neighbor;
                }

                // ignora fechados
                if (closed.some((n) => n.row === row && n.col === col)) {
                    continue;
                }

                const enemy = cell.getPlayer();

                // =====================================
                // casa vazia
                // =====================================

                if (!enemy) {
                    const tentativeG = current.g + 1;

                    if (tentativeG < neighbor.g) {
                        neighbor.parent = current;

                        neighbor.g = tentativeG;

                        neighbor.h = this.heuristic(neighbor, end);

                        neighbor.f = neighbor.g + neighbor.h;

                        if (!open.includes(neighbor)) {
                            open.push(neighbor);
                        }
                    }

                    continue;
                }

                // =====================================
                // batalha REAL
                // =====================================

                const battle = this.createBattle();

                const result = battle.play(this.player, enemy);

                // salva TODAS
                testedBattles.push({
                    position: {
                        row,
                        col,
                    },

                    playerA: result.playerA,
                    playerB: result.playerB,

                    scoreA: result.scoreA,
                    scoreB: result.scoreB,

                    winner: result.winner,

                    rounds: result.rounds,
                });

                // derrota = bloqueia
                if (result.winner === "B") {
                    continue;
                }

                // salva válidas
                successfulBattles.push({
                    position: {
                        row,
                        col,
                    },

                    playerA: result.playerA,
                    playerB: result.playerB,

                    scoreA: result.scoreA,
                    scoreB: result.scoreB,

                    winner: result.winner,

                    rounds: result.rounds,
                });

                const cost = result.winner === "A" ? 2 : 5;

                const tentativeG = current.g + cost;

                // melhor caminho
                if (tentativeG < neighbor.g) {
                    neighbor.parent = current;

                    neighbor.g = tentativeG;

                    neighbor.h = this.heuristic(neighbor, end);

                    neighbor.f = neighbor.g + neighbor.h;

                    if (!open.includes(neighbor)) {
                        open.push(neighbor);
                    }
                }
            }
        }

        // =====================================
        // melhor caminho parcial
        // =====================================

        return {
            path: this.reconstructPath(bestNode),

            testedBattles,

            successfulBattles,
        };
    }
}
