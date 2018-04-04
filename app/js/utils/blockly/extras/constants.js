const DATATYPES = {
    EXPRSN: "expression",
    NUMBER: "number",
    STRING: "string",
    STATMT: "statement",
    STMBTN: "statement_and_btn"
};

const FIELDTYPES = {
    NUMBER:     "Number",
    STRING:     "String",
    COLOUR:     "Colour",
    BRIGHTNESS: "Brightness",
    LINE:       "Line",
    SECONDS:    "Seconds",
    BOOL:       "Boolean"
};

const POSTFIXES = {
    END: 'end',
    ELSE: 'else',
    ELSE_IF: 'else_if',
};

const CATEGORIES = {
    INDEX: {
        colour: "#4E4BFF"
    },
    COLOUR: {
        colour: "#ff8106"
    },
    BUTTON: {
        colour: "#00a897"
    },
    BRIGHTNESS: {
        colour: "#08938b"
    },
    EMIT: {
        colour: "#53a633"
    },
    LINE: {
        colour: "#a10088"
    },
    WAIT: {
        colour: "#ffce75"
    },
    EVENTS: {
        colour: "#0800a1"
    },
    MATH: {
        colour: "#3200ff"
    },
    LOOP: {
        colour: "#00a511"
    },
    LOGIC: {
        colour: "%{BKY_LOGIC_HUE}"
    }
};

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
    MAX_INDEX_VALUE: 30,
    // Максимальное число итераций в циклах
    MAX_REPEAT_TIMES: 500,
    // Максимальное время в команде "ждать"
    MAX_WAIT_SECONDS: 30,
    // Максимальное значение цветового компонента
    MAX_COMPONENT_VALUE: 60,
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
    ],

    // Список доступных кнопок для обработки нажатий
    NUMBER_BUTTONS: [
        ['0', BUTTON_CODES.SYM_0],
        ['1', BUTTON_CODES.SYM_1],
        ['2', BUTTON_CODES.SYM_2],
        ['3', BUTTON_CODES.SYM_3],
        ['4', BUTTON_CODES.SYM_4],
        ['5', BUTTON_CODES.SYM_5],
        ['6', BUTTON_CODES.SYM_6],
        ['7', BUTTON_CODES.SYM_7],
        ['8', BUTTON_CODES.SYM_8],
        ['9', BUTTON_CODES.SYM_9]
    ],

    LETTER_BUTTONS: [
        ['Q', BUTTON_CODES.SYM_Q],
        ['W', BUTTON_CODES.SYM_W],
        ['E', BUTTON_CODES.SYM_E],
        ['R', BUTTON_CODES.SYM_R],
        ['T', BUTTON_CODES.SYM_T],
        ['Y', BUTTON_CODES.SYM_Y],

        ['A', BUTTON_CODES.SYM_A],
        ['S', BUTTON_CODES.SYM_S],
        ['D', BUTTON_CODES.SYM_D],
        ['F', BUTTON_CODES.SYM_F],
        ['G', BUTTON_CODES.SYM_G],
        ['H', BUTTON_CODES.SYM_H],

        ['↑', BUTTON_CODES.UP],
        ['↓', BUTTON_CODES.DOWN],
        ['←', BUTTON_CODES.LEFT],
        ['→', BUTTON_CODES.RIGHT]
    ]
};

export {DATATYPES, FIELDTYPES, POSTFIXES, CATEGORIES, BLOCK_INPUTS_CONSTRAINTS}