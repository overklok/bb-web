import {CATEGORIES, BLOCK_INPUTS_CONSTRAINTS} from "../constants";

import i18next from 'i18next';

const DATATYPES = {
    KEY: "Key"
};

let JSONBlocks = {
    /**
     * Блоки-переменные
     */
    event_key: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.event_key.message'),
                inputsInline:   false,
                output:         DATATYPES.KEY,
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        i18next.t('blockly:blocks.event_key.tooltip'),
            })
        }
    },

    /**
     * Блоки, работающие с переменной "Номер клавиши"
     */
    event_key_onpush_letter: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.event_key_onpush_letter.message'),
                args0: [
                    {
                        type:   "field_dropdown",
                        name:   "BTN",
                        options: BLOCK_INPUTS_CONSTRAINTS.LETTER_BUTTONS
                    },
                    {
                        "type": "input_statement",
                        "name": "DO"
                    }
                ],
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        i18next.t('blockly:blocks.event_key_onpush_letter.tooltip'),
            })
        }
    },

    event_key_onpush_number: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.event_key_onpush_number.message'),
                args0: [
                    {
                        type:   "field_dropdown",
                        name:   "BTN",
                        options: BLOCK_INPUTS_CONSTRAINTS.NUMBER_BUTTONS
                    },
                    {
                        "type": "input_statement",
                        "name": "DO"
                    }
                ],
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        i18next.t('blockly:blocks.event_key_onpush_number.tooltip'),
            })
        }
    },

    event_key_onpush_any: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.event_key_onpush_any.message'),
                args0: [
                    {
                        "type": "input_statement",
                        "name": "DO"
                    }
                ],
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        i18next.t('blockly:blocks.event_key_onpush_any.tooltip'),
            })
        }
    },

    event_key_onpush_any_number: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.event_key_onpush_any_number.message'),
                args0: [
                    {
                        "type": "input_statement",
                        "name": "DO"
                    }
                ],
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        i18next.t('blockly:blocks.event_key_onpush_any_number.tooltip'),
            })
        }
    }
};

export default JSONBlocks;