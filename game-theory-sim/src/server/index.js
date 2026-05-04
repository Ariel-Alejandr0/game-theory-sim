import express from "express";
import cors from "cors";
import { initDB, saveBattle, getBattles, getBattleById } from "./models.js";

const app = express();
app.use(cors());
app.use(express.json());

initDB();

app.listen(3001, () => {
  console.log("🚀 API rodando em http://localhost:3001");
});

app.post("/battles", (req, res) => {
  const id = saveBattle(req.body);
  res.json({ id });
});

app.get("/battles", (req, res) => {
  res.json(getBattles());
});

app.get("/battles/:id", (req, res) => {
  res.json(getBattleById(req.params.id));
});