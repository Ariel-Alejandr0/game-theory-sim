import React from "react"
import Cell from "./Cell.jsx"

export default function Board({ board, playerPos, path, movePlayer }) {
  if (!board) return null

  const reachedGoal = path?.some(
    (p) => p.row === board.end.row && p.col === board.end.col,
  )

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${board.size}, 64px)`,
        gap: "5px",
      }}
    >
      {board.grid.map((row, i) =>
        row.map((cell, j) => {
          const player       = cell.getPlayer()
          const isPlayer     = playerPos.row === i && playerPos.col === j
          const isGoal       = i === board.end.row && j === board.end.col
          const isPath       = path?.some((p) => p.row === i && p.col === j) ?? false
          const isNeighbor   = board
            .getNeighbors(playerPos.row, playerPos.col)
            .some((c) => c.row === i && c.col === j)

          return (
            <Cell
              key={`${i}-${j}`}
              row={i}
              col={j}
              strategy={player?.strategy ?? null}
              isPlayer={isPlayer}
              isPath={isPath}
              reachedGoal={reachedGoal}
              isGoal={isGoal}
              isNeighbor={isNeighbor}
              onClick={() => movePlayer(i, j)}
            />
          )
        }),
      )}
    </div>
  )
}