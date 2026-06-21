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

import prisma from "./db.js";

export const createSession = async (data) => {
  return await prisma.benchmarkSession.create({
    data: {
      repetitions: data.repetitions,
      computer: data.computer,
      sourceFile: data.sourceFile,
      notes: data.notes
    }
  });
};

export const getSessions = async () => {
  return await prisma.benchmarkSession.findMany({
    orderBy: { id: "desc" }
  });
};

export const getSessionById = async (id) => {
  return await prisma.benchmarkSession.findUnique({
    where: { id: Number(id) }
  });
};

export const createRun = async (data) => {
  return await prisma.benchmarkRun.create({
    data: {
      sessionId: Number(data.sessionId),
      map: data.map,
      player: data.player,
      algorithm: data.algorithm,
      success: data.success,
      executionTimeMs: data.executionTimeMs,
      pathLength: data.pathLength,
      testedBattles: data.testedBattles,
      successfulBattles: data.successfulBattles,
      expandedNodes: data.expandedNodes,
      cacheHits: data.cacheHits,
      cacheMisses: data.cacheMisses
    }
  });
};

export const createManyRuns = async (sessionId, runs) => {
  return await prisma.benchmarkRun.createMany({
    data: runs.map((run) => ({
      sessionId: Number(sessionId),
      map: run.map,
      player: run.player,
      algorithm: run.algorithm,
      success: run.success,
      executionTimeMs: run.executionTimeMs,
      pathLength: run.pathLength,
      testedBattles: run.testedBattles,
      successfulBattles: run.successfulBattles,
      expandedNodes: run.expandedNodes,
      cacheHits: run.cacheHits,
      cacheMisses: run.cacheMisses
    }))
  });
};

export const getRunsBySession = async (sessionId) => {
  return await prisma.benchmarkRun.findMany({
    where: { sessionId: Number(sessionId) }
  });
};