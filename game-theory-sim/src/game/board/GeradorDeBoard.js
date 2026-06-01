import { writeFile } from "fs/promises";
import BoardModel from "./Board.js";

const newBoard = new BoardModel(8);
const serialize = newBoard.serialize();

await writeFile(
    "board.txt",
    JSON.stringify(serialize, null, 2),
    "utf8"
);

console.log("Board salva em board.txt");