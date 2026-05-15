import { useState, useEffect } from "react";

import Board from "./components/Board.jsx";
import Controls from "./components/Controls.jsx";
import BattleInfo from "./components/BattleInfo.jsx";
import SaveSelector from "./components/SaveSelector.jsx";

import strategiesMap from "./utils/strategiesMap.js";
import createBattle from "./utils/createBattle.js";
import useGame from "./hooks/useGame.js";

export default function App() {
    const {
        board,
        playerPos,
        movePlayer,
        calculatePath,
        lastBattle,
        loadGame,
        path,
        history,
        loadHistory,
        playerType,
        setPlayerType,
        saveGame,
    } = useGame();

    // restante dos estados...

    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
            }}
        >
            <div
              style={{
                height: "100%",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center'
              }}
            >
                <Controls
                    playerType={playerType}
                    setPlayerType={setPlayerType}
                    strategies={Object.keys(strategiesMap)}
                    calculatePath={calculatePath}
                />

                <SaveSelector
                    history={history}
                    loadGame={loadGame}
                    loadHistory={loadHistory}
                    saveGame={saveGame}
                />

                <BattleInfo battle={lastBattle} />
            </div>

            <Board
                board={board}
                playerPos={playerPos}
                path={path}
                movePlayer={movePlayer}
            />
        </div>
    );
}
