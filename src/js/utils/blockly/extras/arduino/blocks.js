import {CATEGORIES, FIELDTYPES, BLOCK_INPUTS_CONSTRAINTS} from "../constants";
import {appendShadowBlock} from "../_common";

import i18next from 'i18next';

let JSONBlocks = {
    /**
     * Блоки-переменные
     */
    arduino_pin: {
        init: function() {
            this.jsonInit({
                type:           "block_type",
                message0:       i18next.t('blockly:blocks.arduino_pin.message'),
                inputsInline:   false,
                output:         FIELDTYPES.PIN,
                colour:         CATEGORIES.ARDUINO.colour,
                tooltip:        i18next.t('blockly:blocks.arduino_pin.tooltip')
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
                tooltip:        i18next.t('blockly:blocks.arduino_pin_number.tooltip')
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
                message0:   i18next.t('blockly:blocks.arduino_out_write_logical.message'),
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
                tooltip: i18next.t('blockly:blocks.arduino_out_write_logical.tooltip')
            });
            appendShadowBlock(this, "PIN", "arduino_pin_number");
        }
    },

    arduino_out_read_logical: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   i18next.t('blockly:blocks.arduino_out_read_logical.message'),
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
                tooltip: i18next.t('blockly:blocks.arduino_out_read_logical.tooltip'),
            });
            appendShadowBlock(this, "PIN", "arduino_pin_number");
        }
    },

    arduino_out_write_pwm: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   i18next.t('blockly:blocks.arduino_out_write_pwm.message'),
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
                tooltip: i18next.t('blockly:blocks.arduino_out_write_pwm.tooltip'),
            });
            appendShadowBlock(this, "PIN", "arduino_pin_number");
            appendShadowBlock(this, "LVL_PWM", "math_number_pwm");
        }
    },

    arduino_out_read_pwm: {
        init: function() {
            this.jsonInit({
                type:       "block_type",
                message0:   i18next.t('blockly:blocks.arduino_out_read_pwm.message'),
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
                tooltip: i18next.t('blockly:blocks.arduino_out_read_pwm.tooltip'),
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
                message0: i18next.t('blockly:blocks.arduino_out_value.message'),
                args0: [{
                    type: "field_dropdown",
                    name: "PIN",
                    options: BLOCK_INPUTS_CONSTRAINTS.PINS
                }],
                inputsInline: true,
                output: FIELDTYPES.NUMBER,
                colour: CATEGORIES.ARDUINO.colour,
                tooltip: i18next.t('blockly:blocks.arduino_out_read_pwm.tooltip'),
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
                tooltip: i18next.t('blockly:blocks.math_number_pwm.tooltip'),
            });
        }
    }
};

export default JSONBlocks;