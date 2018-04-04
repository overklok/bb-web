import {CATEGORIES, BLOCK_INPUTS_CONSTRAINTS} from "../constants";

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
                message0:       "номер клавиши",
                inputsInline:   false,
                output:         DATATYPES.KEY,
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        "Хранит код клавиши"
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
                message0:       "когда нажата кнопка %1 %2",
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
                "colour":       CATEGORIES.EVENTS.colour,
                "tooltip":      "По нажатию указанной кнопки выполнится код внутри этого блока"
            })
        }
    },

    event_key_onpush_number: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "когда нажата цифра %1 %2",
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
                tooltip:        "По нажатию указанной кнопки выполнится код внутри этого блока"
            })
        }
    },

    event_key_onpush_any: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "когда нажата любая кнопка %1",
                args0: [
                    {
                        "type": "input_statement",
                        "name": "DO"
                    }
                ],
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        "По нажатию любой кнопки выполнится код внутри этого блока." +
                                "Код нажатой кнопки записывается в переменную \"Номер клавиши\"."
            })
        }
    },

    event_key_onpush_any_number: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "когда нажата любая цифра %1",
                args0: [
                    {
                        "type": "input_statement",
                        "name": "DO"
                    }
                ],
                colour:         CATEGORIES.EVENTS.colour,
                tooltip:        "По нажатию любой кнопки выполнится код внутри этого блока." +
                                "Код нажатой кнопки записывается в переменную \"Номер клавиши\"."
            })
        }
    }
};

export default JSONBlocks;