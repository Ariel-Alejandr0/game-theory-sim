import { useEffect, useState } from 'react'
import Battle from "./game/battle/Battle.js"
import PayoffMatrix from "./game/battle/PayoffMatrix.js"
import Player from "./game/Player.js"

import Copycat from "./game/strategies/CopyCat.js"
import Defector from "./game/strategies/Defector.js"
import Cooperate from "./game/strategies/Cooperate.js"
import Random from "./game/strategies/Random.js"
import Grudger from "./game/strategies/Grudger.js"
import Pavlov from "./game/strategies/Pavlov.js"
import Board from './game/board/Board.js'

const strategiesMap = {
  Copycat,
  Defector,
  Cooperate,
  Random,
  Grudger,
  Pavlov
}

export default function App() {

  const [board, setBoard] = useState(null);
  const [playerType, setPlayerType] = useState("Copycat")
  
  const runSimulation = () => {

    const matrix = new PayoffMatrix({
      CC: [3,3],
      CD: [0,5],
      DC: [5,0],
      DD: [1,1]
    })

  }

  useEffect(() => {
    const newBoard = new Board(8)

    const Strategy = strategiesMap[playerType]
    const player = new Player(new Strategy())

    // coloca na célula (0,0)
    newBoard.getCell(0, 0).setPlayer(player)

    setBoard(newBoard)
  }, [])

  useEffect(() => {
    if (board != null && playerType != null) {
      const Strategy = strategiesMap[playerType]
      const player = new Player(new Strategy())
  
      const newBoard = board.clone()
      newBoard.setPlayerAt(0, 0, player)
      setBoard(newBoard)
    }
  }, [playerType])

  return(<div
    style={{
      flexDirection: 'column',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <div>
      <label>Escolha seu jogador: </label>
      <select value={playerType} onChange={(e) => setPlayerType(e.target.value)}>
        {Object.keys(strategiesMap).map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
    <button onClick={runSimulation}>
      Rodar Simulação
    </button>

    {/* 🔥 TABULEIRO AGORA DENTRO DO RETURN */}
    {board && (
      <>
        <h2>Tabuleiro</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${board.size}, 80px)`,
          gap: "5px"
        }}>
          {board.grid.map((row, i) =>
            row.map((cell, j) => {
              const player = cell.getPlayer()
              const isStart = (i === 0 && j === 0)
              const name = player
                ? (isStart ? `PLAYER (${player.strategy.name})` : player.strategy.name)
                : "Empty"

              return (
                <div
                  key={`${i}-${j}`}
                  style={{
                    border: "1px solid black",
                    padding: "10px",
                    textAlign: "center",
                    fontSize: "12px",
                    backgroundColor: isStart
                      ? "#00ffcc"
                      : (i === board.size - 1 && j === board.size - 1)
                      ? "#aaaaff"
                      : "#f0f0f0"
                  }}
                >
                  <div>({i},{j})</div>
                  <strong>{name}</strong>
                </div>
              )
            })
          )}
        </div>
      </>
    )}
    </div>
  )
}