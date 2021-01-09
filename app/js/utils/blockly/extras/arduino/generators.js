import Blockly from "blockly";
import {DATATYPES} from "../constants";
import {getArguments} from "../_common";

let BlocklyJSONGenerators = {
    arduino_pin: block => {
        return ["arduino_pin", Blockly.JSON.ORDER_ATOMIC]
    },

    arduino_pin_number: block => {
        let pin = block.getFieldValue("PIN") || 0;

        return [pin, Blockly.JSON.ORDER_ATOMIC]
    },

    arduino_out_value: block => {
        let pin = block.getFieldValue("PIN") || 0;

        return ["arduino_out_value_" + pin, Blockly.JSON.ORDER_ATOMIC]
    },

    arduino_out_write_logical: block => {
        return JSON.stringify({
            name:       "arduino_out_write_logical",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "PIN",       default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "LVL_LOG",   default: 0, datatype: DATATYPES.NUMBER, complex: false},
            ])
        }) + ","
    },

    arduino_out_read_logical: block => {
        return JSON.stringify({
            name:       "arduino_out_read_logical",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "PIN",       default: 0, datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },

    arduino_out_write_pwm: block => {
        return JSON.stringify({
            name:       "arduino_out_write_pwm",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "PIN",       default: 0, datatype: DATATYPES.NUMBER, complex: true},
                {name: "LVL_PWM",   default: 0, datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },

    arduino_out_read_pwm: block => {
        return JSON.stringify({
            name:       "arduino_out_read_pwm",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "PIN",       default: 0, datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },
};

export default BlocklyJSONGenerators;