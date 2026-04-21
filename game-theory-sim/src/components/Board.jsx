import React from "react";

export default function Board({ board, playerPos, path, movePlayer }) {

  if (!board) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${board.size}, 80px)`,
        gap: "5px"
      }}
    >
      {board.grid.map((row, i) =>
        row.map((cell, j) => {

          const player = cell.getPlayer()

          const isPlayerHere =
            playerPos.row === i && playerPos.col === j

          const neighbors = board.getNeighbors(
            playerPos.row,
            playerPos.col
          )
          const isGoal = i === board.end.row && j === board.end.col
          const reachedGoal = path?.some(p => p.row === board.end.row && p.col === board.end.col)
          
          const isNeighbor = neighbors.some(
            c => c.row === i && c.col === j
          )

          const isPath = path?.some(p => p.row === i && p.col === j)

          const name = player
            ? (isPlayerHere
                ? `PLAYER (${player.strategy.name})`
                : player.strategy.name)
            : "Empty"
          
          return (
            <div
              key={`${i}-${j}`}
              onClick={() => movePlayer(i, j)}
              style={{
                border: "1px solid black",
                padding: "10px",
                textAlign: "center",
                fontSize: "12px",
                cursor: "pointer",

                backgroundColor:
                    isPlayerHere ? "#00ffcc" :
                    isPath && reachedGoal ? "#ffcc00" :
                    isPath ? "#ff8888" : // 🔥 caminho incompleto
                    isGoal ? "#aaaaff" :
                    "#f0f0f0"
              }}
            >
              <div>({i},{j})</div>
              <strong>{name}</strong>
            </div>
          )
        })
      )}
    </div>
  )
}