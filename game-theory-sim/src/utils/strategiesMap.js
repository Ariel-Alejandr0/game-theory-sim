import Copycat from "../game/strategies/CopyCat.js";
import Defector from "../game/strategies/Defector.js";
import Cooperate from "../game/strategies/Cooperate.js";
import Random from "../game/strategies/Random.js";
import Grudger from "../game/strategies/Grudger.js";
import Pavlov from "../game/strategies/Pavlov.js";

const strategiesMap = {
    Copycat,
    Defector,
    Cooperate,
    Random,
    Grudger,
    Pavlov,
};

export default strategiesMap;