import express from "express"
import cors from "cors"

import prisma from "./db.js"

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

app.listen(3001, () => {
  console.log("Servidor rodando em:")
  console.log("http://localhost:3001")
})