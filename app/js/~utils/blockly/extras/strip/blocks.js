// const colour_circles_b64 = require('./colour-circles.json');

import {CATEGORIES, BLOCK_INPUTS_CONSTRAINTS, STRIP_LENGTH} from './constants'

//================================================================
//                  XML-ПЕРЕОПРЕДЕЛЕНИЯ БЛОКОВ
//================================================================

const DATATYPES = {
    NUMBER:     "Number",
    STRING:     "String",
    COLOUR:     "Colour",
    BRIGHTNESS: "Brightness",
    LINE:       "Line"
};

let appendShadowBlock = (block_svg, input_name, block_name) => {
    let numberShadowBlock = block_svg.workspace.newBlock(block_name);
    numberShadowBlock.setShadow(true);
    numberShadowBlock.initSvg();
    numberShadowBlock.render();
    let ob = numberShadowBlock.outputConnection;

    let cc = block_svg.getInput(input_name).connection;
    cc.connect(ob);
};

let BlocklyJSONBlocks = () => {
    return {
        /**
         * Блоки-переменные
         */
        strip_index: {
            init: function() {
                this.jsonInit({
                    type:           "block_type",
                    message0:       "номер лампочки",
                    inputsInline:   false,
                    output:         DATATYPES.NUMBER,
                    colour:         CATEGORIES.INDEX.colour,
                    tooltip:        "Хранит номер лапмочки"
                });
            }
        },

        strip_colour: {
            init: function() {
                this.jsonInit({
                    type:           "block_type",
                    message0:       "цвет",
                    inputsInline:   false,
                    output:         DATATYPES.COLOUR,
                    colour:         CATEGORIES.COLOUR.colour,
                    tooltip:        "Хранит цвет"
                })
            }
        },

        strip_brightness: {
            init: function() {
                this.jsonInit({
                    type:           "block_type",
                    message0:       "яркость",
                    inputsInline:   false,
                    output:         DATATYPES.BRIGHTNESS,
                    colour:         CATEGORIES.BRIGHTNESS.colour,
                    tooltip:        "Хранит значение яркости"
                })
            }
        },

        strip_line: {
            init: function() {
                this.jsonInit({
                    type:           "block_type",
                    message0:       "полоса цветов",
                    inputsInline:   false,
                    output:         DATATYPES.LINE,
                    colour:         CATEGORIES.LINE.colour,
                    tooltip:        "Хранит полосу цветов"
                })
            }
        },

        /**
         * Блоки-константы
         */
        strip_colour_string: {
            init: function() {
                this.jsonInit({
                    type:           "block_type",
                    message0:       "%1",
                    args0: [{
                        type:       "field_dropdown",
                        name:       "CLR",
                        options:    BLOCK_INPUTS_CONSTRAINTS.COLOURS
                    }],
                    inputsInline:   true,
                    output:         DATATYPES.COLOUR,
                    colour:         CATEGORIES.COLOUR.colour,
                    tooltip:        "Варианты готовых цветов"
                })
            }
        },

        /**
         * Блоки, работающие с переменной "Номер лампочки"
         */
        strip_index_set_number: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "перейти к лампочке номер %1",
                    args0: [
                        {
                            type:       "input_value",
                            name:       "IDX",
                            check:      "Number"
                        }
                    ],
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.INDEX.colour,
                    tooltip:            "Изменяет значение встроенной переменной \"Номер лампочки\" на выбранное"
                });

                appendShadowBlock(this, "IDX", "math_number");
            }
        },

        strip_index_inc_one: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "перейти к следующей лампочке",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.INDEX.colour,
                    tooltip:            "Увеличивает значение встроенной переменной \"Номер лампочки\" на 1"
                })
            }
        },

        strip_index_dec_one: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "перейти к предыдущей лампочке",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.INDEX.colour,
                    tooltip:            "Уменьшает значение встроенной переменной \"Номер лампочки\" на 1"
                })
            }
        },

        strip_index_set_rand: {
            init: function() {
                this.jsonInit({
                    type: "block_type",
                    message0: "задать случайный номер лампочки: от %1 до %2",
                    args0: [
                        {
                            type: "input_value",
                            name: "IDX_FROM",
                            check: "Number",
                            value: 1,
                            min: 1,
                            max: STRIP_LENGTH,
                            precision: 1
                        },
                        {
                            type: "input_value",
                            name: "IDX_TO",
                            check: "Number",
                            value: 1,
                            min: 1,
                            max: STRIP_LENGTH,
                            precision: 1
                        }
                    ],
                    previousStatement: null,
                    nextStatement: null,
                    inputsInline: true,
                    colour: CATEGORIES.INDEX.colour,
                    tooltip: "Генерирует случайное число в пределах от 1-го заданного номера до 2-го. " +
                    "Встроенная переменная \"Номер лампочки\" получает сгененрированное значение."
                })
            },
        },

        /**
         * Блоки, работающие с переменной "Цвет"
         */
        strip_colour_set_string: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "задать цвет: %1",
                    args0: [
                        {
                            type:       "input_value",
                            name:       "CLR",
                            check:      DATATYPES.COLOUR
                        }
                    ],
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "Изменяет значение встроенной переменной \"Цвет\" на выбранное"
                })
            }
        },

        strip_colour_set_off: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "сбросить цвет",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "Изменяет значение встроенной переменной \"Цвет\" на чёрный"
                });
            }
        },

        strip_colour_chn_inc_number: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "добавить %1 в %2",
                    args0: [
                        {
                            type:       "input_value",
                            name:       "BRTN",
                            check:      DATATYPES.BRIGHTNESS
                        },
                        {
                            type:       "field_dropdown",
                            name:       "CLRCHN",
                            options:    BLOCK_INPUTS_CONSTRAINTS.CHANNELS.NOMINAL
                        }
                    ],
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "Увеличивает значение заданной компоненты во встроенной переменной \"Цвет\" на заданное число"
                })
            }
        },

        strip_colour_chn_dec_number: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "убавить %1 из %2",
                    args0: [
                        {
                            type:       "input_value",
                            name:       "BRTN",
                            check:      DATATYPES.BRIGHTNESS
                        },
                        {
                            "type":     "field_dropdown",
                            "name":     "CLRCHN",
                            "options":  BLOCK_INPUTS_CONSTRAINTS.CHANNELS.GENITIVE
                        }
                    ],
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "Уменьшает значение заданной компоненты во встроенной переменной \"Цвет\" на заданное число"
                })
            }
        },

        strip_colour_set_rand_string: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "выбрать случайный цвет",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "Изменить значение встроенной переменной \"Цвет\" на случайное из стандартного набора"
                })
            }
        },

        strip_colour_set_rand_number: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "сгенерировать случайный цвет",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "Изменить значение встроенной переменной \"Цвет\" на случайное по всем компонентам"
                })
            }
        },

        strip_colour_current_chn_inc: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "увеличить яркость %1 у лампочки",
                    args0: [
                        {
                            "type":     "field_dropdown",
                            "name":     "CLRCHN",
                            "options":  BLOCK_INPUTS_CONSTRAINTS.CHANNELS.GENITIVE
                        }
                    ],
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "У текущей лампочки выбранный компонент будет гореть ярче"
                })
            }
        },

        strip_colour_current_chn_dec: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "уменьшить яркость %1 у лампочки",
                    args0: [
                        {
                            "type":     "field_dropdown",
                            "name":     "CLRCHN",
                            "options":  BLOCK_INPUTS_CONSTRAINTS.CHANNELS.GENITIVE
                        }
                    ],
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "У текущей лампочки выбранный компонент будет гореть тусклее"
                })
            }
        },

        strip_colour_current_set_line: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "закрасить текущую лампочку",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.COLOUR.colour,
                    tooltip:            "Цвет текущей лампочки становится равным цвету элемента из переменной " +
                                        "\"Полоса цветов\" с соответствующим номером"
                })
            }
        },

        /**
         * Блоки, работающие с переменной "Яркость"
         */
        strip_brightness_set_number: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "задать яркость: %1",
                    args0: [
                        {
                            type:       "input_value",
                            name:       "BRT",
                            check:      DATATYPES.BRIGHTNESS
                        }
                    ],
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       true,
                    colour:             CATEGORIES.BRIGHTNESS.colour,
                    tooltip:            "Изменяет значение встроенной переменной \"Яркость\" на выбранное"
                })
            }
        },

        strip_brightness_set_rand: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "задать случайную яркость",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.BRIGHTNESS.colour,
                    tooltip:            "Генерирует случайное число в пределах от 1-го заданного номера до 2-го. " +
                                        "Встроенная переменная \"Яркость\" получает сгененрированное значение."
                })
            }
        },

        /**
         * Блоки, работающие с переменной "Полоса цветов"
         */
        strip_line_set_off: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "сбросить цвета полосы",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.LINE.colour,
                    tooltip:            "Все цвета полосы становятся чёрными"
                })
            }
        },

        strip_line_set_rand: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "случайные цвета полосы",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.LINE.colour,
                    tooltip:            "Все цвета полосы становятся случайными"
                })
            }
        },

        /**
         * Блоки, соответствующие командам зажигания
         */
        strip_emit_current_color: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "зажечь текущую лампочку",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.EMIT.colour,
                    tooltip:            "Лапочка с номером, равным \"Номеру лампочки\", зажигается цветом, равным \"Цвету\""
                })
            }
        },

        strip_emit_all_off: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "потушить все лампочки",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.EMIT.colour,
                    tooltip:            "Все ламочки гаснут"
                })
            }
        },

        strip_emit_all_colour: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "зажечь все лампочки",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.EMIT.colour,
                    tooltip:            "Все ламочки зажигаются цветом, равным значению переменной \"Цвет\""
                })
            }
        },

        strip_emit_all_list: {
            init: function() {
                this.jsonInit({
                    type:               "block_type",
                    message0:           "зажечь все лампочки полоской",
                    previousStatement:  null,
                    nextStatement:      null,
                    inputsInline:       false,
                    colour:             CATEGORIES.EMIT.colour,
                    tooltip:            "Все ламочки зажигаются цветами виртуальной гирлянды"
                })
            }
        }
    }
};

// console.log(BlocklyJSONBlocks());

let JSONBlocks = BlocklyJSONBlocks();

export default JSONBlocks;