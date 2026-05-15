const matchupPriority = {

    Cooperate: {
        Cooperate: 1,
        Copycat: 2,
        Pavlov: 3,
        Random: 4,
        Grudger: 5,
        Defector: 6
    },

    Copycat: {
        Cooperate: 1,
        Copycat: 2,
        Pavlov: 3,
        Random: 4,
        Grudger: 5,
        Defector: 6
    },

    Defector: {
        Cooperate: 1,
        Random: 2,
        Copycat: 3,
        Pavlov: 4,
        Defector: 5,
        Grudger: 6
    },

    Random: {
        Cooperate: 2,
        Copycat: 3,
        Random: 4,
        Pavlov: 5,
        Defector: 6,
        Grudger: 7
    },

    Pavlov: {
        Cooperate: 2,
        Copycat: 2,
        Pavlov: 3,
        Random: 4,
        Grudger: 5,
        Defector: 6
    },

    Grudger: {
        Cooperate: 2,
        Copycat: 3,
        Pavlov: 4,
        Random: 5,
        Grudger: 6,
        Defector: 8
    }
}
export default matchupPriority