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
  const [history, setHistory] = useState([])

  const loadHistory = async () => {
    const res = await fetch("http://localhost:3001/battles")
    const data = await res.json()
    setHistory(data)
  }

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
  
  const movePlayer = async (row, col) => {
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

    if (enemy) {
      const battle = createBattle()
      const result = battle.play(player, enemy)

      setLastBattle(result)

      // 🔥 DEBUG
      console.log("ENVIANDO PARA API:", result)

      try {
        const res = await fetch("http://localhost:3001/battles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            playerA: result.playerA,
            playerB: result.playerB,
            scoreA: result.scoreA,
            scoreB: result.scoreB,
            winner: result.winner,
            rounds: result.rounds
          })
        })

        const data = await res.json()
        console.log("SALVO NO BANCO:", data)

      } catch (err) {
        console.error("ERRO AO SALVAR:", err)
      }

      // 🔥 AGORA SIM: mover se venceu/empatou
      if (result.winner === "A" || result.winner === "Draw") {
        currentCell.setPlayer(null)
        targetCell.setPlayer(player)

        setBoard(newBoard)
        setPlayerPos({ row, col })
      }

    } else {
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
      <select onChange={async (e) => {
        const id = e.target.value

        const res = await fetch(`http://localhost:3001/battles/${id}`)
        const data = await res.json()

        setLastBattle({
          ...data,
          rounds: JSON.parse(data.rounds)
        })
      }}>
        <option>Selecione uma batalha</option>
        {history.map(b => (
          <option key={b.id} value={b.id}>
            #{b.id} - {b.playerA} vs {b.playerB}
          </option>
        ))}
      </select>
        <button onClick={loadHistory}>
          Carregar Histórico
        </button>
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