-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerType" TEXT NOT NULL,
    "playerPos" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "lastBattle" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
