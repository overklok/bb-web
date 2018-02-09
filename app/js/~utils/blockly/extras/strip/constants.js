const CATEGORIES = {
    INDEX: {
        colour: 54
    },
    COLOUR: {
        colour: 194
    },
    BUTTON: {
        colour: 230
    },
    BRIGHTNESS: {
        colour: 152
    },
    EMIT: {
        colour: 280
    },
    LINE: {
        colour: 70
    }
};

const STRIP_LENGTH = 110;

const BUTTON_CODES = {
    SYM_0: "48",    SYM_Q: "81",    SYM_A: "65",    UP: "38",
    SYM_1: "49",    SYM_W: "87",    SYM_S: "83",    DOWN: "40",
    SYM_2: "50",    SYM_E: "69",    SYM_D: "68",    LEFT: "37",
    SYM_3: "51",    SYM_R: "82",    SYM_F: "70",    RIGHT: "39",
    SYM_4: "52",    SYM_T: "84",    SYM_G: "71",
    SYM_5: "53",    SYM_Y: "89",    SYM_H: "72",
    SYM_6: "54",
    SYM_7: "55",
    SYM_8: "56",
    SYM_9: "57",
};

// Ограничения ввода в блоках
const BLOCK_INPUTS_CONSTRAINTS = {
    // Максимальное число итераций в циклах
    MAX_REPEAT_TIMES: 500,
    // Максимальное время в команде "ждать"
    MAX_WAIT_SECONDS: 30,
    // Максимальное значение цветового компонента
    MAX_COMPONENT_VALUE: 250,
    // Список цветов
    COLOURS: [
        ["синий", "blue"],
        ["голубой", "light_blue"],
        ["зелёный", "green"],
        ["красный", "red"],
        ["жёлтый", "yellow"],
        ["оранжевый", "orange"],
        ["фиолетовый", "violet"],
        ["белый", "white"]
    ],

    CHANNELS: {
        NOMINAL: [
            ["красный", "red"],
            ["зелёный", "green"],
            ["синий", "blue"]
        ],
        GENITIVE: [
            ["красного", "red"],
            ["зелёного", "green"],
            ["синего", "blue"]
        ]
    },

    // Напраления смещения цветов лампочек гирлянды
    SLIDE_DIRECTIONS: [
        ['← влево', 'left'],
        ['→ вправо', 'right']
    ]
};

export {CATEGORIES, BLOCK_INPUTS_CONSTRAINTS, STRIP_LENGTH}