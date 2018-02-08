import Blockly from 'node-blockly/browser';

const DATATYPES = {
    NUMBER: "number",
    STRING: "string"
};

const POSTFIXES = {
    END: 'end',
    ELSE: 'else',
    ELSE_IF: 'else_if',
};

/**
 * Получить аргумент с предопределённым значением
 *
 * @param value     значение
 * @param datatype  тип данных аргумента
 * @returns {{value: *, datatype: *}}   аргумент
 */
let getPredef = (value, datatype) => {
    return {
        value: value,
        type: datatype
    }
};

/**
 * Получить аргумент в заданном блоке
 *
 * Для сложных полей тип данных аргумента может изменяться, если
 * поле содержит арифметическое выражение
 *
 * @param block             блок Blockly
 * @param field_name        название поля
 * @param default_value     значение аргумента по умолчанию
 * @param datatype          предполагаемый тип данных аргумента
 * @param complex           является ли поле сложным
 * @returns {{value: *, type: *}}   аргумент
 */
let getArgument = (block, field_name, default_value, datatype, complex) => {
    let arg = {
        value: default_value,
        type: datatype
    };

    if (block.getField(field_name)) {
        // Internal number
        if (datatype === DATATYPES.NUMBER) {
            // arg.value = String(Number(block.getFieldValue(field_name)));
            arg.value = parseInt(block.getFieldValue(field_name));
        }

        if (datatype === DATATYPES.STRING) {
            arg.value = block.getFieldValue(field_name);
        }
    } else if (complex) {
        // External number
        arg.value = Blockly.JavaScript.valueToCode(block, field_name, Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
        arg.type = DATATYPES.STRING
    }

    return arg;
};

/**
 * Получить массив аргументов по заданному массиву полей
 *
 * @param block
 * @param fields
 * @returns {Array}
 */
let getArguments = (block, fields) => {
    let args = [];

    for (let field of fields) {
        args.push(getArgument(block, field.name, field.default, field.datatype, field.complex));
    }

    return args;
};


let BlocklyJSONGenerators = {
    leds_color: block => {
        let result = JSON.stringify({
            name: "leds_color",
            block_id: block.id,
            args: getArguments(block, [
                {name: "COLOR", default: "black", datatype: DATATYPES.STRING, complex: false}
            ])
        });

        return result + ",";
    },

    leds_off: block => {
        let result = JSON.stringify({
            name: "leds_off",
            block_id: block.id,
            args: []
        });

        return result + ",";
    },

    led_off: block => {
        let result = JSON.stringify({
            name: "led_off",
            block_id: block.id,
            args: [
                getArgument(block, "NUM", 0, DATATYPES.NUMBER, true),
            ]
        });

        return result + ",";
    },

    swap_leds: block => {
        let result = JSON.stringify({
            name: "swap_leds",
            block_id: block.id,
            args: getArguments(block, [
                {name: "NUM1", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "NUM2", default: 0, datatype: DATATYPES.NUMBER, complex: true}
            ])
        });

        return result + ",";
    },

    led_color: block => {
        let result = JSON.stringify({
            name: "led_color",
            block_id: block.id,
            args: getArguments(block, [
                {name: "NUM", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR", default: "black", datatype: DATATYPES.STRING, complex: false}
            ])
        });

        return result + ",";
    },

    set_next_led: block => {
        let result = JSON.stringify({
            name: "set_next_led",
            block_id: block.id,
            args: [
                getArgument(block, "COLOR", "black", DATATYPES.STRING, false)
            ]
        });

        return result + ",";
    },

    set_prev_led: block => {
        let result = JSON.stringify({
            name: "set_prev_led",
            block_id: block.id,
            args: [
                getArgument(block, "COLOR", "black", DATATYPES.STRING, false)
            ]
        });

        return result + ",";
    },

    set_leds_mix: block => {
        let result = JSON.stringify({
            name: "set_leds_mix",
            block_id: block.id,
            args: getArguments(block, [
                {name: "COLOR_RED", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_GREEN", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_BLUE", default: 0, datatype: DATATYPES.NUMBER, complex: true},
            ])
        });

        return result + ",";
    },

    set_led_mix: block => {
        let result = JSON.stringify({
            name: "set_led_mix",
            block_id: block.id,
            args: getArguments(block, [
                {name: "NUM", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_RED", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_GREEN", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_BLUE", default: 0, datatype: DATATYPES.NUMBER, complex: true},
            ])
        });

        return result + ",";
    },

    set_next_led_mix: block => {
        let result = JSON.stringify({
            name: "set_next_led_mix",
            block_id: block.id,
            args: getArguments(block, [
                {name: "COLOR_RED", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_GREEN", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_BLUE", default: 0, datatype: DATATYPES.NUMBER, complex: true},
            ])
        });

        return result + ",";
    },

    set_prev_led_mix: block => {
        let result = JSON.stringify({
            name: "set_prev_led_mix",
            block_id: block.id,
            args: getArguments(block, [
                {name: "COLOR_RED", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_GREEN", default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "COLOR_BLUE", default: 0, datatype: DATATYPES.NUMBER, complex: true},
            ])
        });

        return result + ",";
    },

    slide_leds: block => {
        let result = JSON.stringify({
            name: "slide_leds",
            block_id: block.id,
            args: [
                getArgument(block, "DIRECTION", "left", DATATYPES.STRING, false)
            ]
        });

        return result + ",";
    },

    //brightness
    set_brightness: block => {
        let result = JSON.stringify({
            name: "set_brightness",
            block_id: block.id,
            args: [
                getArgument(block, "VALUE", 0, DATATYPES.NUMBER, true),
                getArgument(block, "NUM", 0, DATATYPES.NUMBER, false)
            ]
        });

        return result + ",";
    },

    //change brightness
    change_brightness_up: block => {
        let result = JSON.stringify({
            name: "change_brightness_up",
            block_id: block.id,
            args: [
                getArgument(block, "DIFF", 0, DATATYPES.NUMBER, true),
                getArgument(block, "NUM", 0, DATATYPES.NUMBER, false)
            ]
        });

        return result + ",";
    },

    change_brightness_down: block => {
        let result = JSON.stringify({
            name: "change_brightness_down",
            block_id: block.id,
            args: [
                getArgument(block, "DIFF", 0, DATATYPES.NUMBER, true),
                getArgument(block, "NUM", 0, DATATYPES.NUMBER, false)
            ]
        });

        return result + ",";
    },

    wait_seconds: block => {
        let result = JSON.stringify({
            name: "wait_seconds",
            block_id: block.id,
            args: [
                getArgument(block, "SECS", 0, DATATYPES.NUMBER, true)
            ]
        });

        return result + ",";
    },

    //Shadow blocks
    led_number: block => {
        // Integer value
        let code = parseInt(block.getFieldValue('NUM'));

        return [code, Blockly.JavaScript.ORDER_ATOMIC];
    },

    brightness_value: block => {
        // Integer value
        let code = parseInt(block.getFieldValue('VALUE'));

        return [code, Blockly.JavaScript.ORDER_ATOMIC];
    },

    brightness_diff: block => {
        // Integer value.
        let code = parseInt(block.getFieldValue('DIFF'));

        return [code, Blockly.JavaScript.ORDER_ATOMIC];
    },

    seconds_value: block => {
        // Integer value.
        let code = parseInt(block.getFieldValue('SECS'));

        return [code, Blockly.JavaScript.ORDER_ATOMIC];
    },

    repeats_value: block => {
        // Integer value.
        let code = parseInt(block.getFieldValue('TIMES'));

        return [code, Blockly.JavaScript.ORDER_ATOMIC];
    },

//Output blocks
    get_brightness: block => {
        let br_num = parseInt(block.getFieldValue('NUM')) - 1;
        let output = 'brightness_' + br_num;

        return [output, Blockly.JavaScript.ORDER_ATOMIC];
    },

    get_led_num: block => {
        let ln_num = parseInt(block.getFieldValue('NUM')) - 1;
        let output = 'led_num' + ln_num;

        return [output, Blockly.JavaScript.ORDER_ATOMIC];
    },

    //Math (should be in math.js)
    math_multiply: block => {
        let a = Blockly.JavaScript.valueToCode(block, 'A', Blockly.JavaScript.ORDER_MULTIPLICATION) || '0';
        let b = Blockly.JavaScript.valueToCode(block, 'B', Blockly.JavaScript.ORDER_MULTIPLICATION) || '0';

        return [ a + ' * ' + b, Blockly.JavaScript.ORDER_MULTIPLICATION];
    },

    number: block => {
        let num = block.getFieldValue('NUM');

        return [num, Blockly.JavaScript.ORDER_ATOMIC];
    },

    math_subtract: block => {
        let a = Blockly.JavaScript.valueToCode(block, 'A', Blockly.JavaScript.ORDER_SUBTRACTION) || '0';
        let b = Blockly.JavaScript.valueToCode(block, 'B', Blockly.JavaScript.ORDER_SUBTRACTION) || '0';

        return [ a + ' - ' + b, Blockly.JavaScript.ORDER_SUBTRACTION];
    },

    arrow_btn_pressed: block => {
        let branch = Blockly.JavaScript.statementToCode(block, 'DO');

        let head = JSON.stringify({
            name: "arrow_btn_pressed",
            block_id: block.id,
            args: [
                getArgument(block, "SCANCODE", 0, DATATYPES.NUMBER, false)
            ]
        });

        let tail = JSON.stringify({
            name: "arrow_btn_pressed" + "." + POSTFIXES.END,
            args: []
        });

        return head + "," + branch + tail + ",";
    },

    // Переопределение сторонних генераторов

    controls_repeat_ext: block => {
        let branch = Blockly.JavaScript.statementToCode(block, 'DO');

        let head = JSON.stringify({
            name: "controls_repeat_ext",
            block_id: block.id,
            args: [
                getArgument(block, "TIMES", 1, DATATYPES.NUMBER, true)
            ]
        });

        let tail = JSON.stringify({
            name: "controls_repeat_ext" + "." + "POSTFIXES.END",
            args: []
        });

        return head + "," + branch + tail + ",";
    },

    controls_if: block => {
        let n = 0;

        let condition_code, branch_code;
        let code = "";

        do {
            condition_code = Blockly.JavaScript.valueToCode(block, 'IF' + n, Blockly.JavaScript.ORDER_NONE) || 'false';
            branch_code = Blockly.JavaScript.statementToCode(block, 'DO' + n);

            if (n === 0) {
                code += JSON.stringify({
                    name: "controls_if",
                    args: [
                        {"value": condition_code, "type": DATATYPES.STRING}
                    ]
                });
            }
            else {
                code += JSON.stringify({
                    name: "controls_if" + "." + POSTFIXES.ELSE_IF,
                    args: []
                });
            }

            code += "," + branch_code;
            n++;
        } while(block.getInput("IF" + n));

        if (block.getInput("ELSE")) {
            branch_code = Blockly.JavaScript.statementToCode(block, 'ELSE');

            code += JSON.stringify({
                name: "controls_if" + "." + POSTFIXES.ELSE,
                args: []
            });

            code += "," + branch_code;
        }

        code += JSON.stringify({
            name: "controls_if" + "." + POSTFIXES.END,
            args: []
        });

        return code + ",";
    },

    logic_boolean: block => {
        let code = (block.getFieldValue('BOOL') === 'TRUE') ? "1" : "0";
        return [code, Blockly.JavaScript.ORDER_ATOMIC];
    }
};

BlocklyJSONGenerators['brightness_value_red'] =
    BlocklyJSONGenerators['brightness_value_green'] =
        BlocklyJSONGenerators['brightness_value_blue'] =
            BlocklyJSONGenerators['brightness_value'];

BlocklyJSONGenerators['letter_btn_pressed'] =
    BlocklyJSONGenerators['arrow_btn_pressed'];

export default BlocklyJSONGenerators;