import Battle from "../game/battle/Battle.js";
import PayoffMatrix from "../game/battle/PayoffMatrix.js";

export default function createBattle() {
    return new Battle(
        5,
        new PayoffMatrix({
            CC: [3, 3],
            CD: [0, 5],
            DC: [5, 0],
            DD: [1, 1],
        }),
    );
}