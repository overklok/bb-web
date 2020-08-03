import {CATEGORIES, FIELDTYPES, BLOCK_INPUTS_CONSTRAINTS} from "../constants";
import {appendShadowBlock} from "../_common";

let JSONBlocks = {
    /**
     * Блоки-переменные
     */
    dummy_1: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "dummy 1",
                inputsInline:   false,
                output:         FIELDTYPES.NUMBER,
                colour:         CATEGORIES.DUMMY.colour,
                tooltip:        "Dummy-переменная (1)"
            })
        }
    },

    dummy_2: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "dummy 2",
                inputsInline:   false,
                output:         FIELDTYPES.NUMBER,
                colour:         CATEGORIES.DUMMY.colour,
                tooltip:        "Dummy-переменная (2)"
            })
        }
    },

    /**
     * Блоки-функции
     */
    set_dummy: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   "Set %1 = %2",
                args0: [
                    {
                        type:       "field_dropdown",
                        name:       "VAR",
                        options:    BLOCK_INPUTS_CONSTRAINTS.DUMMY_VARS
                    },
                    {
                        type:       "input_value",
                        name:       "VAL",
                        check:      FIELDTYPES.NUMBER
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                inputsInline: true,
                colour: CATEGORIES.DUMMY.colour,
                tooltip: "Подаёт значение на dummy-переменную"
            });
            appendShadowBlock(this, "VAL", "math_number");
        }
    },
};

export default JSONBlocks;