import { db } from "./db.js";

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS battles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerA TEXT,
      playerB TEXT,
      scoreA INTEGER,
      scoreB INTEGER,
      winner TEXT,
      rounds TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function saveBattle(result) {
  const stmt = db.prepare(`
    INSERT INTO battles (playerA, playerB, scoreA, scoreB, winner, rounds)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    result.playerA,
    result.playerB,
    result.scoreA,
    result.scoreB,
    result.winner,
    JSON.stringify(result.rounds)
  );

  return info.lastInsertRowid;
}

export function getBattles() {
  return db.prepare(`SELECT * FROM battles ORDER BY createdAt DESC`).all();
}

export function getBattleById(id) {
  return db.prepare(`SELECT * FROM battles WHERE id = ?`).get(id);
}