import {FIELDTYPES, CATEGORIES, BLOCK_INPUTS_CONSTRAINTS, STRIP_LENGTH} from '../constants'
import {appendShadowBlock} from '../_common'

import i18next from 'i18next';

let JSONBlocks = {
    controls_if: {
        init: function() {
            this.jsonInit({
                type:     "block_type",
                message0: "%{BKY_CONTROLS_IF_MSG_IF} %1",
                args0: [
                    {
                      type: "input_value",
                      name: "IF0",
                      check: "Boolean"
                    }
                ],
                message1: "%{BKY_CONTROLS_IF_MSG_THEN} %1",
                args1: [
                    {
                        type: "input_statement",
                        name: "DO0"
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                style: "logic_blocks",
                helpUrl: "%{BKY_CONTROLS_IF_HELPURL}",
                extensions: ["controls_if_tooltip"]
            })
        }
    },

    controls_ifelse: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "%{BKY_CONTROLS_IF_MSG_IF} %1",
                args0: [
                    {
                        type: "input_value",
                        name: "IF0",
                        check: "Boolean"
                    }
                ],
                message1: "%{BKY_CONTROLS_IF_MSG_THEN} %1",
                args1: [
                    {
                        "type": "input_statement",
                        "name": "DO0"
                    }
                ],
                message2: "%{BKY_CONTROLS_IF_MSG_ELSE} %1",
                args2: [
                    {
                        "type": "input_statement",
                        "name": "ELSE"
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                style: "logic_blocks",
                tooltip: "%{BKYCONTROLS_IF_TOOLTIP_2}",
                helpUrl: "%{BKY_CONTROLS_IF_HELPURL}",
                extensions: ["controls_if_tooltip"]
            })
        }
    }, 

    logic_neg: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%{BKY_LOGIC_NEGATE_TITLE}",
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
                tooltip:        "%{BKY_LOGIC_NEGATE_TOOLTIP}",
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
                tooltip:        i18next.t('blockly:blocks.logic_eq.tooltip'),
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_lt: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 < %2",
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
                tooltip:        i18next.t('blockly:blocks.logic_lt.tooltip'),
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_gt: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1 > %2",
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
                tooltip:        i18next.t('blockly:blocks.logic_gt.tooltip'),
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
                tooltip:        i18next.t('blockly:blocks.logic_ge.tooltip'),
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
                tooltip:        i18next.t('blockly:blocks.logic_le.tooltip'),
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_and: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.logic_and.message'),
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
                tooltip:        i18next.t('blockly:blocks.logic_and.tooltip'),
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
    logic_or: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.logic_or.message'),
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
                tooltip:        i18next.t('blockly:blocks.logic_or.tooltip'),
            });
            // appendShadowBlock(this, "A", "logic_boolean");
            // appendShadowBlock(this, "B", "logic_boolean");
        }
    },
};

export default JSONBlocks;