import prisma from "./db.js"

export const createGame = async (data) => {
  return await prisma.game.create({
    data: {
      playerType: data.playerType,
      playerPos: JSON.stringify(data.playerPos),
      path: JSON.stringify(data.path),
      lastBattle: JSON.stringify(data.lastBattle),
      board: JSON.stringify(data.board)
    }
  })
}

export const getGames = async () => {
  return await prisma.game.findMany({
    orderBy: { id: "desc" }
  })
}

export const getGameById = async (id) => {
  return await prisma.game.findUnique({
    where: { id: Number(id) }
  })
}