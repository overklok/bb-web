import {CATEGORIES, FIELDTYPES, BLOCK_INPUTS_CONSTRAINTS} from "../constants";
import {appendShadowBlock} from "../_common";

let JSONBlocks = {
    /**
     * Блоки-переменные
     */
    arduino_pin: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "Контакт",
                inputsInline:   false,
                output:         FIELDTYPES.PIN,
                colour:         CATEGORIES.ARDUINO.colour,
                tooltip:        "Хранит номер контакта (пин)"
            })
        }
    },

    /**
     * Блоки-константы
     */
    arduino_pin_number: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       "%1",
                args0: [{
                    type:       "field_dropdown",
                    name:       "PIN",
                    options:    BLOCK_INPUTS_CONSTRAINTS.PINS
                }],
                inputsInline:   true,
                output:         FIELDTYPES.PIN,
                colour:         CATEGORIES.ARDUINO.colour,
                tooltip:        "Номера доступных контактов"
            })
        }
    },

    /**
     * Блоки-функции
     */
    arduino_out_write_logical: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   "подать на %1 %2",
                args0: [
                    {
                        type: "input_value",
                        name: "PIN",
                        check: FIELDTYPES.PIN
                    },
                    {
                        type: "field_dropdown",
                        name: "LVL_LOG",
                        options: BLOCK_INPUTS_CONSTRAINTS.LOGICAL_LEVELS
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                inputsInline: true,
                colour: CATEGORIES.ARDUINO.colour,
                tooltip: "Подаёт на выход логический 0 или 1"
            });
            appendShadowBlock(this, "PIN", "arduino_pin_number");
        }
    },

    arduino_out_read_logical: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   "считать +/- с %1",
                args0: [
                    {
                        type: "input_value",
                        name: "PIN",
                        check: FIELDTYPES.PIN
                    },
                ],
                previousStatement: null,
                nextStatement: null,
                inputsInline: true,
                colour: CATEGORIES.ARDUINO.colour,
                tooltip: "Считывает с выхода логический 0 или 1"
            });
            appendShadowBlock(this, "PIN", "arduino_pin_number");
        }
    },

    arduino_out_write_pwm: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   "подать на %1 ШИМ %2",
                args0: [
                    {
                        type: "input_value",
                        name: "PIN",
                        check: FIELDTYPES.PIN
                    },
                    {
                        type: "input_value",
                        name: "LVL_PWM",
                        check: FIELDTYPES.NUMBER
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                inputsInline: true,
                colour: CATEGORIES.ARDUINO.colour,
                tooltip: "Подаёт на выход значение ШИМ"
            });
            appendShadowBlock(this, "PIN", "arduino_pin_number");
            appendShadowBlock(this, "LVL_PWM", "math_number_pwm");
        }
    },

    arduino_out_read_pwm: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   "аналоговое чтение с %1",
                args0: [
                    {
                        type: "input_value",
                        name: "PIN",
                        check: FIELDTYPES.PIN
                    },
                ],
                previousStatement: null,
                nextStatement: null,
                inputsInline: true,
                colour: CATEGORIES.ARDUINO.colour,
                tooltip: "Считывать с выхода значение ШИМ"
            });
            appendShadowBlock(this, "PIN", "arduino_pin_number");
        }
    },

    /**
     * Блоки-функции с возвратом
     */
    arduino_out_value: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "значение с выхода %1",
                args0: [{
                    type: "field_dropdown",
                    name: "PIN",
                    options: BLOCK_INPUTS_CONSTRAINTS.PINS
                }],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.ARDUINO.colour,
                tooltip: "Значение на выходе"
            })
        }
    },
    
    math_number_pwm: {
        init: function() {
            this.jsonInit({
                type: "block_type",
                message0: "%1",
                args0: [
                    {
                        type: "field_number",
                        name: "NUM",
                        min: 0,
                        max: BLOCK_INPUTS_CONSTRAINTS.MAX_PWM_VALUE,
                        precision: 1
                    },
                ],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.PWM.colour,
                tooltip: "Значение ШИМ"
            });
        }
    }
};

export default JSONBlocks;