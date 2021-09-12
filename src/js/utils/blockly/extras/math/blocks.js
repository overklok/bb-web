import {FIELDTYPES, CATEGORIES, BLOCK_INPUTS_CONSTRAINTS} from '../constants'
import {appendShadowBlock} from '../_common'

import i18next from 'i18next';

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
                tooltip:        i18next.t("blockly:blocks.math_mul.tooltip"),
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
                tooltip:        i18next.t("blockly:blocks.math_add.tooltip"),
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
                tooltip:        i18next.t("blockly:blocks.math_sub.tooltip"),
            });
            appendShadowBlock(this, "A", "math_number");
            appendShadowBlock(this, "B", "math_number");
        }
    },

    math_div: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 / %2",
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
                tooltip:        i18next.t("blockly:blocks.math_div.tooltip"),
            });
            appendShadowBlock(this, "A", "math_number");
            appendShadowBlock(this, "B", "math_number");
        }
    },

    math_mod: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 % %2",
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
                tooltip:        i18next.t("blockly:blocks.math_mod.tooltip"),
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
                tooltip: i18next.t("blockly:blocks.math_number.tooltip"),
            });
        }
    },
};

export default JSONBlocks;