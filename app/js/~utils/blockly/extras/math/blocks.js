import {FIELDTYPES, CATEGORIES, BLOCK_INPUTS_CONSTRAINTS, STRIP_LENGTH} from '../constants'
import {appendShadowBlock} from '../_common'

let JSONBlocks = {
    math_mul: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 * %2",
                args0: [
                    {
                        type:       "input_value",
                        name:       "A",
                        check:      FIELDTYPES.NUMBER
                    },
                    {
                        type:       "input_value",
                        name:       "B",
                        check:      FIELDTYPES.NUMBER
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.NUMBER,
                colour:         CATEGORIES.MATH.colour,
                tooltip:        "Умножает два числа"
            });
            appendShadowBlock(this, "A", "math_number");
            appendShadowBlock(this, "B", "math_number");
        }
    },

    math_add: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 + %2",
                args0: [
                    {
                        type:       "input_value",
                        name:       "A"
                    },
                    {
                        type:       "input_value",
                        name:       "B"
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.NUMBER,
                colour:         CATEGORIES.MATH.colour,
                tooltip:        "Складывает два числа"
            });
            appendShadowBlock(this, "A", "math_number");
            appendShadowBlock(this, "B", "math_number");
        }
    },

    math_sub: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 - %2",
                args0: [
                    {
                        type:       "input_value",
                        name:       "A"
                    },
                    {
                        type:       "input_value",
                        name:       "B"
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.NUMBER,
                colour:         CATEGORIES.MATH.colour,
                tooltip:        "Вычитает два числа"
            });
            appendShadowBlock(this, "A", "math_number");
            appendShadowBlock(this, "B", "math_number");
        }
    },

    math_number: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "%1",
                args0: [
                    {
                        type: "field_number",
                        name: "NUM",
                        min: 0,
                        precision: 1
                    },
                ],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.MATH.colour,
                tooltip: "Целое число"
            });
        }
    },

    math_number_index: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "%1",
                args0: [
                    {
                        type: "field_number",
                        name: "NUM",
                        min: 1,
                        max: BLOCK_INPUTS_CONSTRAINTS.MAX_INDEX_VALUE,
                        precision: 1
                    },
                ],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.INDEX.colour,
                tooltip: "Целое число"
            });
        }
    },
    math_number_brightness: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "%1",
                args0: [
                    {
                        type: "field_number",
                        name: "NUM",
                        min: 0,
                        max: BLOCK_INPUTS_CONSTRAINTS.MAX_COMPONENT_VALUE,
                        precision: 1
                    },
                ],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.BRIGHTNESS.colour,
                tooltip: "Целое число"
            });
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
                tooltip: "Целое число"
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
                tooltip: "Целое число"
            });
        }
    },
};

export default JSONBlocks;