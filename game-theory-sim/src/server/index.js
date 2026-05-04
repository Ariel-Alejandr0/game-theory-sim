import express from "express"
import cors from "cors"
import { createGame, getGames, getGameById } from "./models.js"

const app = express()

app.use(cors())
app.use(express.json())

app.post("/games", async (req, res) => {
  try {
    const game = await createGame(req.body)
    res.json(game)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao salvar" })
  }
})

app.get("/games", async (req, res) => {
  const games = await getGames()
  res.json(games)
})

app.get("/games/:id", async (req, res) => {
  const game = await getGameById(req.params.id)
  res.json(game)
})

app.listen(3001, () => {
  console.log("Server rodando em http://localhost:3001")
})