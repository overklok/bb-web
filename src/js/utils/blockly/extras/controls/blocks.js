import {FIELDTYPES, CATEGORIES, BLOCK_INPUTS_CONSTRAINTS} from '../constants'
import {appendShadowBlock} from "../_common";

import i18next from 'i18next';

let JSONBlocks = {
    /**
     * Блоки-переменные
     */
    controls_wait_seconds: {
        init: function () {
            this.jsonInit({
                type:               "block_type",
                message0:           i18next.t('blockly:blocks.controls_wait_seconds.message'),
                args0: [
                    {
                        type:       "input_value",
                        name:       "SECS",
                        check:      FIELDTYPES.NUMBER
                    }
                ],
                previousStatement:  null,
                nextStatement:      null,
                inputsInline:       true,
                colour: CATEGORIES.WAIT.colour,
                tooltip: i18next.t('blockly:blocks.controls_wait_seconds.tooltip'),
            });
            appendShadowBlock(this, "SECS", "math_number_seconds");
        }
    },

    controls_repeat_ext: {
        init: function () {
            this.jsonInit({
                message0: "%{BKY_CONTROLS_REPEAT_TITLE}",
                args0: [{
                    "type": "input_value",
                    "name": "TIMES",
                    "check": "Number"
                }],
                message1: "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
                args1: [{
                    "type": "input_statement",
                    "name": "DO"
                }],
                previousStatement: null,
                nextStatement: null,
                colour: "%{BKY_LOOPS_HUE}",
                tooltip: "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
                helpUrl: "%{BKY_CONTROLS_REPEAT_HELPURL}"
            });
            appendShadowBlock(this, "TIMES", "math_number_repeats");
        }
    },

    math_number_seconds: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "%1",
                args0: [
                    {
                        type: "field_number",
                        name: "NUM",
                        min: 1,
                        max: BLOCK_INPUTS_CONSTRAINTS.MAX_WAIT_SECONDS,
                        precision: 1
                    },
                ],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.WAIT.colour,
                tooltip: i18next.t('blockly:blocks.math_number_seconds.tooltip'),
            });
        }
    },

    math_number_repeats: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "%1",
                args0: [
                    {
                        type: "field_number",
                        name: "NUM",
                        min: 1,
                        max: BLOCK_INPUTS_CONSTRAINTS.MAX_REPEAT_TIMES,
                        precision: 1
                    },
                ],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.LOOP.colour,
                tooltip: i18next.t('blockly:blocks.math_number_repeats.tooltip'),
            });
        }
    },
};

export default JSONBlocks;