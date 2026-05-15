import { useEffect, useState } from "react";

import AStar from "../game/pathFinding/AStar.js";
import BoardModel from "../game/board/Board.js";

import createBattle from "../utils/createBattle.js";
import Player from "../game/Player.js";
import strategiesMap from "../utils/strategiesMap.js";

export default function useGame() {
    const [board, setBoard] = useState(null);

    const [playerPos, setPlayerPos] = useState({
        row: 0,
        col: 0,
    });

    const [path, setPath] = useState([]);

    const [lastBattle, setLastBattle] = useState(null);

    const [battleHistory, setBattleHistory] = useState([]);

    const [playerType, setPlayerType] = useState("Copycat");
    const [history, setHistory] = useState([]);
    // =========================================
    // MOVE PLAYER
    // =========================================

    const movePlayer = async (row, col) => {
        if (!board) return;

        const { row: currentRow, col: currentCol } = playerPos;

        const neighbors = board.getNeighbors(currentRow, currentCol);

        const isNeighbor = neighbors.some(
            (cell) => cell.row === row && cell.col === col,
        );

        if (!isNeighbor) return;

        const newBoard = board.clone();

        const currentCell = newBoard.getCell(currentRow, currentCol);

        const targetCell = newBoard.getCell(row, col);

        const player = currentCell.getPlayer();

        const enemy = targetCell.getPlayer();

        // =========================================
        // BATTLE
        // =========================================

        if (enemy) {
            const battle = createBattle();

            const result = battle.play(player, enemy);

            setLastBattle(result);

            try {
                const res = await fetch("http://localhost:3001/battles", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        playerA: result.playerA,
                        playerB: result.playerB,

                        scoreA: result.scoreA,
                        scoreB: result.scoreB,

                        winner: result.winner,

                        rounds: result.rounds,
                    }),
                });

                const data = await res.json();

                console.log("SALVO:", data);
            } catch (err) {
                console.error("ERRO AO SALVAR BATALHA:", err);
            }

            // move apenas se ganhou/empatou

            if (result.winner === "A" || result.winner === "Draw") {
                currentCell.setPlayer(null);

                targetCell.setPlayer(player);

                setBoard(newBoard);

                setPlayerPos({ row, col });
            }
        }

        // =========================================
        // MOVE NORMAL
        // =========================================
        else {
            currentCell.setPlayer(null);

            targetCell.setPlayer(player);

            setBoard(newBoard);

            setPlayerPos({ row, col });
        }
    };

    // =========================================
    // CALCULATE PATH
    // =========================================

    const calculatePath = () => {
        if (!board) return;

        const player = board.getCell(playerPos.row, playerPos.col).getPlayer();

        const astar = new AStar(board, player, createBattle);

        const resultPath = astar.findSmart(playerPos, board.end);

        setPath(resultPath);

        const battles = [];

        for (const step of resultPath) {
            const cell = board.getCell(step.row, step.col);

            const enemy = cell.getPlayer();

            // ignora vazio

            if (!enemy) continue;

            // ignora posição inicial

            if (step.row === playerPos.row && step.col === playerPos.col) {
                continue;
            }

            const battle = createBattle();

            const result = battle.play(player, enemy);

            battles.push({
                position: {
                    row: step.row,
                    col: step.col,
                },

                playerA: result.playerA,
                playerB: result.playerB,

                scoreA: result.scoreA,
                scoreB: result.scoreB,

                winner: result.winner,

                rounds: result.rounds,
            });
        }

        setBattleHistory(battles);

        console.log("BATTLES:", battles);
    };

    // =========================================
    // LOAD GAME
    // =========================================

    const saveGame = async () => {
        if (!board) {
            console.warn("Nenhum board para salvar.");
            return;
        }

        const gameState = {
            playerType,

            playerPos: {
                row: playerPos.row,
                col: playerPos.col,
            },

            path: path ?? [],

            battles: battleHistory ?? [],

            payoffMatrix: {
                CC: [3, 3],
                CD: [0, 5],
                DC: [5, 0],
                DD: [1, 1],
            },

            // transforma classes em JSON puro
            board: board.serialize(),
        };

        try {
            console.log("SALVANDO GAME:", gameState);

            const response = await fetch("http://localhost:3001/games", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(gameState),
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            const savedGame = await response.json();

            console.log("GAME SALVO:", savedGame);

            return savedGame;
        } catch (error) {
            console.error("ERRO AO SALVAR GAME:", error);

            return null;
        }
    };

    // =========================================
    // LOAD GAME
    // =========================================

    const loadGame = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/games/${id}`, {
                cache: "no-store",
            });

            const game = await res.json();

            const restoredBoard = BoardModel.fromJSON(game.board);

            setBoard(restoredBoard);

            setPlayerType(game.playerType);

            setPlayerPos(game.playerPos);

            setPath(game.path);

            setBattleHistory(game.battles);
        } catch (err) {
            console.error("ERRO AO CARREGAR GAME:", err);
        }
    };

    // =========================================
    // LOAD HISTORY
    // =========================================

    const loadHistory = async () => {
        try {
            const res = await fetch("http://localhost:3001/games", {
                cache: "no-store",
            });

            const data = await res.json();

            setHistory(data);

            console.log("HISTORY:", data);
        } catch (err) {
            console.error("ERRO AO CARREGAR HISTÓRICO:", err);
        }
    };

    // =========================================
    // EFFECTS
    // =========================================

    useEffect(() => {
        const newBoard = new BoardModel(8);

        const Strategy = strategiesMap[playerType];

        const player = new Player(new Strategy());

        newBoard.getCell(0, 0).setPlayer(player);

        setBoard(newBoard);
    }, []);

    useEffect(() => {
        const Strategy = strategiesMap[playerType];

        const newPlayer = new Player(new Strategy());

        setBoard((prevBoard) => {
            if (!prevBoard) return prevBoard;

            const clonedBoard = prevBoard.clone();

            console.log(
                "ANTES:",
                clonedBoard.getCell(playerPos.row, playerPos.col).getPlayer()
                    ?.strategy?.name,
            );

            clonedBoard
                .getCell(playerPos.row, playerPos.col)
                .setPlayer(newPlayer);

            console.log(
                "DEPOIS:",
                clonedBoard.getCell(playerPos.row, playerPos.col).getPlayer()
                    ?.strategy?.name,
            );

            return clonedBoard;
        });
    }, [playerType]);

    // =========================================
    // RETURN
    // =========================================

    return {
        board,
        setBoard,
        playerPos,
        setPlayerPos,
        playerType,
        setPlayerType,
        path,
        lastBattle,
        battleHistory,
        movePlayer,
        calculatePath,
        loadGame,
        history,
        loadHistory,
        saveGame
    };
}
