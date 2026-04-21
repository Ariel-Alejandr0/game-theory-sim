// game/pathFinding/AStar.js

class Node {
  constructor(row, col){
    this.row = row
    this.col = col
    this.g = Infinity
    this.h = 0
    this.f = Infinity
    this.parent = null
  }
}

export default class AStar {

  constructor(board, player, createBattle){
    this.board = board
    this.player = player
    this.createBattle = createBattle
  }

  heuristic(a, b){
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
  }

  getCost(enemy){
    if (!enemy) return 1

    const battle = this.createBattle()
    const result = battle.play(this.player, enemy)

    if (result.winner === "A") return 2
    if (result.winner === "EMPATE") return 5

    return Infinity
  }

  reconstructPath(node){
    const path = []

    let current = node
    while (current) {
      path.unshift({ row: current.row, col: current.col })
      current = current.parent
    }

    return path
  }

  find(start, end){

    const open = []
    const closed = []
    const nodes = {}

    const key = (r, c) => `${r}-${c}`

    const startNode = new Node(start.row, start.col)
    startNode.g = 0
    startNode.h = this.heuristic(start, end)
    startNode.f = startNode.h

    // ✅ inicialização correta
    let bestNode = startNode

    open.push(startNode)
    nodes[key(start.row, start.col)] = startNode

    while (open.length > 0) {

        open.sort((a, b) => a.f - b.f)
        const current = open.shift()

        // ✅ atualiza melhor nó AQUI
        if (current.h <= bestNode.h) {
            bestNode = current
        }

        // 🎯 chegou no destino
        if (current.row === end.row && current.col === end.col) {
            return this.reconstructPath(current)
        }

        closed.push(current)

        const neighbors = this.board.getNeighbors(current.row, current.col)

        for (const cell of neighbors) {
            const { row, col } = cell
            const k = key(row, col)

            let neighbor = nodes[k]

            if (!neighbor) {
                neighbor = new Node(row, col)
                nodes[k] = neighbor
            }

            if (closed.some(n => n.row === row && n.col === col)) continue

            const enemy = cell.getPlayer()
            const cost = this.getCost(enemy)

            // 🔥 bloqueia caminho impossível
            if (cost === Infinity) continue

            const tentativeG = current.g + cost

            if (tentativeG < neighbor.g) {
                neighbor.parent = current
                neighbor.g = tentativeG
                neighbor.h = this.heuristic(neighbor, end)
                neighbor.f = neighbor.g + neighbor.h

                if (!open.includes(neighbor)) {
                    open.push(neighbor)
                }
            }
        }
    }

        // 🔥 retorno parcial
        return this.reconstructPath(bestNode)
    }
}