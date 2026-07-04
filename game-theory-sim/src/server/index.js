import express from "express"
import cors from "cors"
import { fileURLToPath } from "url"
import path from "path"
import os from "os"
import prisma from "./db.js"
import BenchmarkSuite from "../game/benchmark/BenchmarkSuite.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BENCHMARK_DIR = path.resolve(__dirname, "../game/benchmark")

const app = express()
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store")
  next()
})

// =====================================
// POST /games
// salva um jogo
// =====================================
app.post("/games", async (req, res) => {
  try {
    const game = await prisma.game.create({
      data: {
        playerType: req.body.playerType,
        playerPos: JSON.stringify(req.body.playerPos),
        board: JSON.stringify(req.body.board),
        path: JSON.stringify(req.body.path),
        battles: JSON.stringify(req.body.battles),
        payoffMatrix: JSON.stringify(req.body.payoffMatrix)
      }
    })
    res.json(game)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao salvar jogo"
    })
  }
})

// =====================================
// GET /games
// lista jogos
// =====================================
app.get("/games", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        id: "desc"
      }
    })
    res.json(games)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao buscar jogos"
    })
  }
})

// =====================================
// GET /games/:id
// carrega jogo específico
// =====================================
app.get("/games/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const game = await prisma.game.findUnique({
      where: {
        id
      }
    })
    if (!game) {
      return res.status(404).json({
        error: "Jogo não encontrado"
      })
    }
    res.json({
      ...game,
      playerPos: JSON.parse(game.playerPos),
      board: JSON.parse(game.board),
      path: JSON.parse(game.path),
      battles: JSON.parse(game.battles),
      payoffMatrix: JSON.parse(game.payoffMatrix)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao carregar jogo"
    })
  }
})

// ======================================
// GET ALL MAPS
// ======================================
app.get("/maps", async (req, res) => {
  try {
    const maps = await prisma.presetMap.findMany({
      orderBy: {
        difficulty: "asc",
      },
    });
    res.json(maps);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Erro ao buscar mapas",
    });
  }
});

// =====================================
// POST /sessions
// salva uma sessão de benchmark
// =====================================
app.post("/sessions", async (req, res) => {
  try {
    const session = await prisma.benchmarkSession.create({
      data: {
        repetitions: req.body.repetitions,
        computer: req.body.computer,
        sourceFile: req.body.sourceFile,
        notes: req.body.notes
      }
    })
    res.json(session)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao salvar sessão de benchmark"
    })
  }
})

// =====================================
// GET /sessions
// lista sessões de benchmark
// =====================================
app.get("/sessions", async (req, res) => {
  try {
    const sessions = await prisma.benchmarkSession.findMany({
      orderBy: {
        id: "desc"
      }
    })
    res.json(sessions)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao buscar sessões de benchmark"
    })
  }
})

// =====================================
// GET /sessions/:id
// carrega sessão específica
// =====================================
app.get("/sessions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const session = await prisma.benchmarkSession.findUnique({
      where: {
        id
      }
    })
    if (!session) {
      return res.status(404).json({
        error: "Sessão não encontrada"
      })
    }
    res.json(session)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao carregar sessão"
    })
  }
})

// =====================================
// POST /runs
// salva um run de benchmark
// =====================================
app.post("/runs", async (req, res) => {
  try {
    const run = await prisma.benchmarkRun.create({
      data: {
        sessionId: Number(req.body.sessionId),
        map: req.body.map,
        player: req.body.player,
        algorithm: req.body.algorithm,
        success: req.body.success,
        executionTimeMs: req.body.executionTimeMs,
        pathLength: req.body.pathLength,
        testedBattles: req.body.testedBattles,
        successfulBattles: req.body.successfulBattles,
        expandedNodes: req.body.expandedNodes,
        cacheHits: req.body.cacheHits,
        cacheMisses: req.body.cacheMisses
      }
    })
    res.json(run)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao salvar run de benchmark"
    })
  }
})

// =====================================
// POST /runs/bulk
// salva vários runs de benchmark de uma vez (uma única transação)
// =====================================
app.post("/runs/bulk", async (req, res) => {
  try {
    const { sessionId, runs } = req.body
    const result = await prisma.benchmarkRun.createMany({
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
    })
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao salvar runs de benchmark em lote"
    })
  }
})

// =====================================
// GET /runs?sessionId=   (sessionId opcional — sem ele retorna todos)
// lista runs de benchmark
// =====================================
app.get("/runs", async (req, res) => {
  try {
    const where = req.query.sessionId
      ? { sessionId: Number(req.query.sessionId) }
      : {}
    const runs = await prisma.benchmarkRun.findMany({ where })
    res.json(runs)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Erro ao buscar runs de benchmark"
    })
  }
})

// =====================================
// POST /benchmark/run
// executa a suite de benchmark e salva os resultados
// =====================================
app.post("/benchmark/run", async (req, res) => {
  try {
    const {
      players    = ["Copycat"],
      algorithms = ["basic", "cached"],
      repetitions = 10,
      notes      = null,
    } = req.body

    const maps = [
      path.join(BENCHMARK_DIR, "board8.txt"),
      path.join(BENCHMARK_DIR, "board80.txt"),
      path.join(BENCHMARK_DIR, "board800.txt"),
    ]

    const suite = new BenchmarkSuite({ maps, players, algorithms, repetitions })
    const results = await suite.run()

    const session = await prisma.benchmarkSession.create({
      data: {
        repetitions,
        computer: os.hostname(),
        sourceFile: "UI",
        notes,
      }
    })

    await prisma.benchmarkRun.createMany({
      data: results.map((run) => ({
        sessionId: session.id,
        map: "./" + path.basename(run.map),
        player: run.player,
        algorithm: run.algorithm,
        success: run.success,
        executionTimeMs: run.executionTimeMs,
        pathLength: run.pathLength,
        testedBattles: run.testedBattles,
        successfulBattles: run.successfulBattles,
        expandedNodes: run.expandedNodes,
        cacheHits: run.cacheHits,
        cacheMisses: run.cacheMisses,
      }))
    })

    res.json({ session, count: results.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao executar benchmark" })
  }
})

app.listen(3001, () => {
  console.log("Servidor rodando em:")
  console.log("http://localhost:3001")
})