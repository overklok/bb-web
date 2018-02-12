import Blockly from 'node-blockly/browser';

import {getPredef, getArgument, getArguments} from '../_common';

import {DATATYPES, POSTFIXES} from '../constants';

let BlocklyJSONGenerators = {
    strip_index: block => {
        return ["strip_index", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_colour: block => {
        return ["strip_colour", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_brightness: block => {
        return ["strip_brightness", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_line: block => {
        return ["strip_line", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_colour_string: block => {
        let color = block.getFieldValue("CLR") || "black";

        return [color, Blockly.JSON.ORDER_ATOMIC]
    },

    strip_index_set_number: block => {
        return JSON.stringify({
            name:       "strip_index_set_number",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "IDX", default: 1, datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },

    strip_index_inc_one: block => {
        return JSON.stringify({
            name:       "strip_index_inc_one",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_index_dec_one: block => {
        return JSON.stringify({
            name:       "strip_index_dec_one",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_index_set_rand: block => {
        return JSON.stringify({
            name:       "strip_index_set_rand",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "IDX_FROM",  default: 1, datatype: DATATYPES.NUMBER, complex: true},
                {name: "IDX_TO",    default: 1, datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },

    strip_colour_set_string: block => {
        return JSON.stringify({
            name:       "strip_colour_set_string",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "CLR", default: "black", datatype: DATATYPES.STRING, complex: true}
            ])
        }) + ","
    },

    strip_colour_set_off: block => {
        return JSON.stringify({
            name:       "strip_colour_set_off",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_colour_chn_inc: block => {
        return JSON.stringify({
            name:       "strip_colour_chn_inc",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "BRT",       default: 0,     datatype: DATATYPES.NUMBER, complex: true},
                {name: "CLRCHN",    default: "red", datatype: DATATYPES.STRING, complex: false},
            ])
        }) + ","
    },

    strip_colour_chn_dec: block => {
        return JSON.stringify({
            name:       "strip_colour_chn_dec",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "BRT",       default: 0,     datatype: DATATYPES.NUMBER, complex: true},
                {name: "CLRCHN",    default: "red", datatype: DATATYPES.STRING, complex: false},
            ])
        }) + ","
    },

    strip_colour_set_rand_string: block => {
        return JSON.stringify({
            name:       "strip_colour_set_rand_string",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_colour_set_rand_number: block => {
        return JSON.stringify({
            name:       "strip_colour_set_rand_number",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_colour_current_chn_inc: block => {
        return JSON.stringify({
            name:       "strip_colour_current_chn_inc",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "CLRCHN", default: "red", datatype: DATATYPES.STRING, complex: false}
            ])
        }) + ","
    },

    strip_colour_current_chn_dec: block => {
        return JSON.stringify({
            name:       "strip_colour_current_chn_dec",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "CLRCHN", default: "red", datatype: DATATYPES.STRING, complex: false}
            ])
        }) + ","
    },

    strip_colour_current_set_line: block => {
        return JSON.stringify({
            name:       "strip_colour_current_set_line",
            block_id:   block.id,
            args:       getArguments(block, [])
        }) + ","
    },

    strip_brightness_set_number: block => {
        return JSON.stringify({
            name:       "strip_brightness_set_number",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "BRT", default: 0, datatype: DATATYPES.NUMBER, complex: true}
            ])
        }) + ","
    },

    strip_brightness_set_rand: block => {
        return JSON.stringify({
            name:       "strip_brightness_set_rand",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_line_set_off: block => {
        return JSON.stringify({
            name:       "strip_line_set_off",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_line_set_rand: block => {
        return JSON.stringify({
            name:       "strip_line_set_rand",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_current_color: block => {
        return JSON.stringify({
            name:       "strip_emit_current_color",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_all_off: block => {
        return JSON.stringify({
            name:       "strip_emit_all_off",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_all_colour: block => {
        return JSON.stringify({
            name:       "strip_emit_all_colour",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_all_list: block => {
        return JSON.stringify({
            name:       "strip_emit_all_list",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    //Math (should be in math.js)
    math_multiply: block => {
        let a = Blockly.JSON.valueToCode(block, 'A', Blockly.JSON.ORDER_MULTIPLICATION) || '0';
        let b = Blockly.JSON.valueToCode(block, 'B', Blockly.JSON.ORDER_MULTIPLICATION) || '0';

        return [ a + ' * ' + b, Blockly.JSON.ORDER_MULTIPLICATION];
    },

    number: block => {
        let num = block.getFieldValue('NUM');

        return [num, Blockly.JSON.ORDER_ATOMIC];
    },

    math_subtract: block => {
        let a = Blockly.JSON.valueToCode(block, 'A', Blockly.JSON.ORDER_SUBTRACTION) || '0';
        let b = Blockly.JSON.valueToCode(block, 'B', Blockly.JSON.ORDER_SUBTRACTION) || '0';

        return [ a + ' - ' + b, Blockly.JSON.ORDER_SUBTRACTION];
    },

    arrow_btn_pressed: block => {
        let branch = Blockly.JSON.statementToCode(block, 'DO');

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
        let branch = Blockly.JSON.statementToCode(block, 'DO');

        let head = JSON.stringify({
            name: "controls_repeat_ext",
            block_id: block.id,
            args: [
                getArgument(block, "TIMES", 1, DATATYPES.NUMBER, true)
            ]
        });

        let tail = JSON.stringify({
            name: "controls_repeat_ext" + "." + POSTFIXES.END,
            args: []
        });

        return head + "," + branch + tail + ",";
    },

    controls_if: block => {
        let n = 0;

        let condition_code, branch_code;
        let code = "";

        do {
            condition_code = Blockly.JSON.valueToCode(block, 'IF' + n, Blockly.JSON.ORDER_NONE) || 0;
            branch_code = Blockly.JSON.statementToCode(block, 'DO' + n);

            if (n === 0) {
                code += JSON.stringify({
                    name: "controls_if",
                    args: [
                        {"value": condition_code, "type": DATATYPES.EXPRSN}
                    ]
                });
            }
            else {
                code += JSON.stringify({
                    name: "controls_if" + "." + POSTFIXES.ELSE_IF,
                    args: [
                        {"value": condition_code, "type": DATATYPES.EXPRSN}
                    ]
                });
            }

            code += "," + branch_code;
            n++;
        } while(block.getInput("IF" + n));

        if (block.getInput("ELSE")) {
            branch_code = Blockly.JSON.statementToCode(block, 'ELSE');

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
        return [code, Blockly.JSON.ORDER_ATOMIC];
    }
};

BlocklyJSONGenerators['letter_btn_pressed'] =
    BlocklyJSONGenerators['arrow_btn_pressed'];

export default BlocklyJSONGenerators;