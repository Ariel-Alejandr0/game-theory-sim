import { useEffect, useState } from 'react'
import Board from './components/Board.jsx'

import Battle from "./game/battle/Battle.js"
import PayoffMatrix from "./game/battle/PayoffMatrix.js"
import Player from "./game/Player.js"

import Copycat from "./game/strategies/CopyCat.js"
import Defector from "./game/strategies/Defector.js"
import Cooperate from "./game/strategies/Cooperate.js"
import Random from "./game/strategies/Random.js"
import Grudger from "./game/strategies/Grudger.js"
import Pavlov from "./game/strategies/Pavlov.js"
import BoardModel from './game/board/Board.js'
import AStar from "./game/pathFinding/AStar.js"

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
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 })
  const [lastBattle, setLastBattle] = useState(null)
  const [path, setPath] = useState(null)

  const calculatePath = () => {
    if (!board) return

    const player = board
      .getCell(playerPos.row, playerPos.col)
      .getPlayer()

    const astar = new AStar(board, player, createBattle)

    const resultPath = astar.find(playerPos, board.end)

    console.log("PATH:", resultPath)

    setPath(resultPath)
  }
  
  const movePlayer = (row, col) => {
    if (!board) return

    const { row: currentRow, col: currentCol } = playerPos

    const neighbors = board.getNeighbors(currentRow, currentCol)

    const isNeighbor = neighbors.some(cell =>
      cell.row === row && cell.col === col
    )

    if (!isNeighbor) return

    const newBoard = board.clone()

    const currentCell = newBoard.getCell(currentRow, currentCol)
    const targetCell = newBoard.getCell(row, col)

    const player = currentCell.getPlayer()
    const enemy = targetCell.getPlayer()

    // 🔥 SE TEM INIMIGO → BATALHA
    if (enemy) {
      const battle = createBattle()

      const result = battle.play(player, enemy)
      setLastBattle(result);
      console.log("BATALHA:", result)

      if (result.winner === "A" || result.winner === "EMPATE") {
        // (venceu ou empatou) -> move
        currentCell.setPlayer(null)
        targetCell.setPlayer(player)

        setBoard(newBoard)
        setPlayerPos({ row, col })

      } else {
        // perdeu → não move
        console.log("Você perdeu a ou empatou a batalha!")
      }

    } else {
      // célula vazia → move normal
      currentCell.setPlayer(null)
      targetCell.setPlayer(player)

      setBoard(newBoard)
      setPlayerPos({ row, col })
    }
  }

  const runSimulation = () => {

    const matrix = new PayoffMatrix({
      CC: [3,3],
      CD: [0,5],
      DC: [5,0],
      DD: [1,1]
    })

  }

  const createBattle = () => {
    const result = new Battle(
      5,
      new PayoffMatrix({
        CC: [3,3],
        CD: [0,5],
        DC: [5,0],
        DD: [1,1]
      })
    )
    return result;
  }

  useEffect(() => {
    const newBoard = new BoardModel(8)

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
    <button onClick={calculatePath}>
      Calcular Caminho
    </button>
    {lastBattle && (
      <div>
        <h3>Última batalha</h3>
        <p>Score A: {lastBattle.scoreA}</p>
        <p>Score B: {lastBattle.scoreB}</p>
        <p>Vencedor: {lastBattle.winner}</p>
      </div>
    )}
    {/* 🔥 TABULEIRO AGORA DENTRO DO RETURN */}
    <Board
      board={board}
      playerPos={playerPos}
      path={path}
      movePlayer={movePlayer}
    />
    </div>
  )
}