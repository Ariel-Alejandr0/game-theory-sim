import { useState } from 'react'
import Battle from "./game/battle/Battle.js"
import PayoffMatrix from "./game/battle/PayoffMatrix.js"
import Player from "./game/Player.js"

import Copycat from "./game/strategies/CopyCat.js"
import Defector from "./game/strategies/Defector.js"
import Cooperate from "./game/strategies/Cooperate.js"
import Random from "./game/strategies/Random.js"
import Grudger from "./game/strategies/Grudger.js"
import Pavlov from "./game/strategies/Pavlov.js"

const strategiesMap = {
  Copycat,
  Defector,
  Cooperate,
  Random,
  Grudger,
  Pavlov
}

function App() {

  const [playerAType, setPlayerAType] = useState("Copycat")
  const [playerBType, setPlayerBType] = useState("Defector")
  const [result, setResult] = useState(null)

  const runSimulation = () => {

    const matrix = new PayoffMatrix({
      CC: [3,3],
      CD: [0,5],
      DC: [5,0],
      DD: [1,1]
    })

    const StrategyA = strategiesMap[playerAType]
    const StrategyB = strategiesMap[playerBType]

    const playerA = new Player(new StrategyA())
    const playerB = new Player(new StrategyB())

    const battle = new Battle(5, matrix)

    const result = battle.play(playerA, playerB)

    setResult(result)
  }

  return (
    <div>
      <h1>Game Theory Simulation</h1>

      <h2>Escolha os jogadores</h2>

      <div>
        <label>Player A: </label>
        <select value={playerAType} onChange={(e) => setPlayerAType(e.target.value)}>
          {Object.keys(strategiesMap).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Player B: </label>
        <select value={playerBType} onChange={(e) => setPlayerBType(e.target.value)}>
          {Object.keys(strategiesMap).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <br />

      <button onClick={runSimulation}>
        Rodar Simulação
      </button>

      {result && (
        <>
          <h2>Players</h2>
          <p>A: {result.playerA}</p>
          <p>B: {result.playerB}</p>

          <h2>Resultado</h2>
          <p>Score A: {result.scoreA}</p>
          <p>Score B: {result.scoreB}</p>
          <p>Vencedor: {result.winner}</p>

          <h2>Rodadas</h2>
          {result.rounds.map(r => (
            <div key={r.round}>
              Round {r.round}: 
              A={r.moveA} | B={r.moveB} → 
              +{r.pointsA} / +{r.pointsB}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default App