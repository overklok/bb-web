// Переопределение сторонних генераторов
    import Blockly from "blockly";
import {getArgument} from "../_common";
import {DATATYPES, POSTFIXES} from "../constants";

let BlocklyJSONGenerators = {
    controls_wait_seconds: block => {
        return JSON.stringify({
            name: "controls_wait_seconds",
            block_id: block.id,
            args: [
                getArgument(block, "SECS", 1, DATATYPES.NUMBER, true)
            ]
        }) + ","
    },

    controls_repeat_ext: block => {
        let branch = Blockly.JSON.statementToCode(block, 'DO', false);

        let head = JSON.stringify({
            name: "controls_repeat_ext",
            block_id: block.id,
            args: [
                getArgument(block, "TIMES", 1, DATATYPES.NUMBER, true)
            ]
        });

        let tail = JSON.stringify({
            name: "controls_repeat_ext" + "." + POSTFIXES.END,
            block_id: block.id,
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
            branch_code = Blockly.JSON.statementToCode(block, 'DO' + n, false);

            if (n === 0) {
                code += JSON.stringify({
                    name: "controls_if",
                    block_id: block.id,
                    args: [
                        {"value": condition_code, "type": DATATYPES.EXPRSN}
                    ]
                });
            }
            else {
                code += JSON.stringify({
                    name: "controls_if" + "." + POSTFIXES.ELSE_IF,
                    block_id: block.id,
                    args: [
                        {"value": condition_code, "type": DATATYPES.EXPRSN}
                    ]
                });
            }

            code += "," + branch_code;
            n++;
        } while (block.getInput("IF" + n));

        if (block.getInput("ELSE")) {
            branch_code = Blockly.JSON.statementToCode(block, 'ELSE', false);

            code += JSON.stringify({
                name: "controls_if" + "." + POSTFIXES.ELSE,
                block_id: block.id,
                args: []
            });

            code += "," + branch_code;
        }

        code += JSON.stringify({
            name: "controls_if" + "." + POSTFIXES.END,
            block_id: block.id,
            args: []
        });

        return code + ",";
    }
};

export default BlocklyJSONGenerators;