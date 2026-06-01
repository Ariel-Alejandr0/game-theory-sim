// game/pathFinding/AStar.js

import matchupCost from "./PreComputedMatrix.js";
import Node from "./Node.js";
import MinHeap from "./MinHeap.js";
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
    // 🔥 A* inteligente
    // =========================================

    findCached(start, end) {
        const startTime = performance.now();
        this.metrics = {
            expandedNodes: 0,
            cacheHits: 0,
            cacheMisses: 0,

            testedBattles: 0,
            successfulBattles: 0,
            failedBattles: 0,

            pathLength: 0,
            executionTime: 0,
            reachedGoal: false,
        };
        const open = new MinHeap();
        const openSet = new Set();
        const closedSet = new Set();
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

        while (!open.isEmpty()) {
            this.metrics.expandedNodes++;

            const current = open.pop();

            if (current.h <= bestNode.h) {
                bestNode = current;
            }

            if (current.row === end.row && current.col === end.col) {
                const path = this.reconstructPath(current);
                this.metrics.pathLength = path.length;
                this.metrics.reachedGoal = true;
                this.metrics.executionTime = performance.now() - startTime;
                return {
                    path,
                    testedBattles,
                    successfulBattles,
                    metrics: this.metrics,
                };
            }

            closedSet.add(key(current.row, current.col));

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

                if (closedSet.has(k)) {
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

                        if (!open.has(k)) {
                            open.push(neighbor);
                            openSet.add(k);
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
                    this.metrics.cacheHits++;
                    result = battleCache[cacheKey];
                } else {
                    this.metrics.cacheMisses++;
                    // 🔥 batalha REAL
                    const battle = this.createBattle();

                    result = battle.play(this.player, enemy);
                    this.metrics.testedBattles++;

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
                    this.metrics.failedBattles++;
                    continue;
                } else {
                    this.metrics.successfulBattles++;
                }

                if (!(enemyType !== "Random" && battleCache[cacheKey])) {
                    successfulBattles.push({
                        position: { row, col },

                        playerA: result.playerA,
                        playerB: result.playerB,

                        scoreA: result.scoreA,
                        scoreB: result.scoreB,

                        winner: result.winner,

                        rounds: result.rounds,
                    });
                }

                const cost = result.winner === "A" ? 2 : 5;

                const tentativeG = current.g + cost;

                if (tentativeG < neighbor.g) {
                    neighbor.parent = current;

                    neighbor.g = tentativeG;

                    neighbor.h = this.heuristic(neighbor, end);

                    neighbor.f = neighbor.g + neighbor.h;

                    if (!openSet.has(neighbor)) {
                        open.push(neighbor);
                    }
                }
            }
        }
        const path = this.reconstructPath(bestNode);
        this.metrics.pathLength = path.length;
        this.metrics.reachedGoal = false;
        this.metrics.executionTime = performance.now() - startTime;
        return {
            path,
            testedBattles,
            successfulBattles,
            metrics: this.metrics,
        };
    }

    findBasic(start, end) {
        const startTime = performance.now();
        this.metrics = {
            expandedNodes: 0,
            cacheHits: 0,
            cacheMisses: 0,

            testedBattles: 0,
            successfulBattles: 0,
            failedBattles: 0,

            pathLength: 0,
            executionTime: 0,
            reachedGoal: false,
        };
        const open = [];
        const closedSet = new Set();
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
            this.metrics.expandedNodes++;
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
                const path = this.reconstructPath(current);
                this.metrics.pathLength = path.length;
                this.metrics.reachedGoal = true;
                this.metrics.executionTime = performance.now() - startTime;
                return {
                    path,
                    metrics: this.metrics,
                    testedBattles,
                    successfulBattles,
                };
            }

            closedSet.add(key(current.row, current.col));

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
                if (closedSet.has(k)) {
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
                this.metrics.testedBattles++;

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
                    this.metrics.failedBattles++;
                    continue;
                } else {
                    this.metrics.successfulBattles++;
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
        const path = this.reconstructPath(bestNode);
        this.metrics.pathLength = path.length;
        this.metrics.reachedGoal = false;
        this.metrics.executionTime = performance.now() - startTime;
        return {
            path,
            metrics: this.metrics,
            testedBattles,
            successfulBattles,
        };
    }
}
