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
    }
};

export default BlocklyJSONGenerators;