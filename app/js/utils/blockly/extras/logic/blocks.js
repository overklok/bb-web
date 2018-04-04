import {FIELDTYPES, CATEGORIES, BLOCK_INPUTS_CONSTRAINTS, STRIP_LENGTH} from '../constants'
import {appendShadowBlock} from '../_common'

let JSONBlocks = {
    logic_neg: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "не %1",
                args0: [
                    {
                        type:   "input_value",
                        name:   "BOOL",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Отрицание"
            });
            // appendShadowBlock(this, "BOOL", "logic_boolean");
        }
    },
    logic_eq: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 == %2",
                args0: [
                    {
                        type:   "input_value",
                        name:   "A",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    },
                    {
                        type:   "input_value",
                        name:   "B",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Равенство"
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_lt: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 << %2",
                args0: [
                    {
                        type:   "input_value",
                        name:   "A",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    },
                    {
                        type:   "input_value",
                        name:   "B",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Меньше"
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_gt: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 >> %2",
                args0: [
                    {
                        type:   "input_value",
                        name:   "A",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    },
                    {
                        type:   "input_value",
                        name:   "B",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Больше"
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_ge: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 >= %2",
                args0: [
                    {
                        type:   "input_value",
                        name:   "A",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    },
                    {
                        type:   "input_value",
                        name:   "B",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Больше либо равно"
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_le: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 <= %2",
                args0: [
                    {
                        type:   "input_value",
                        name:   "A",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    },
                    {
                        type:   "input_value",
                        name:   "B",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Меньше либо равно"
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_and: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 и %2",
                args0: [
                    {
                        type:   "input_value",
                        name:   "A",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    },
                    {
                        type:   "input_value",
                        name:   "B",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Оба значения истинны"
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_or: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 или %2",
                args0: [
                    {
                        type:   "input_value",
                        name:   "A",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    },
                    {
                        type:   "input_value",
                        name:   "B",
                        check:  [FIELDTYPES.BOOL, FIELDTYPES.NUMBER]
                    }
                ],
                inputsInline:   true,
                output:         FIELDTYPES.BOOL,
                colour:         CATEGORIES.LOGIC.colour,
                tooltip:        "Одно из значений истинно"
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
};

export default JSONBlocks;