/*
  Warnings:

  - You are about to drop the column `lastBattle` on the `Game` table. All the data in the column will be lost.
  - Added the required column `battles` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payoffMatrix` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerType" TEXT NOT NULL,
    "playerPos" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "battles" TEXT NOT NULL,
    "payoffMatrix" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Game" ("board", "createdAt", "id", "path", "playerPos", "playerType") SELECT "board", "createdAt", "id", "path", "playerPos", "playerType" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
