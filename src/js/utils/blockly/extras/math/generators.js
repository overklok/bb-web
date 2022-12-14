import Blockly from "blockly";

let BlocklyJSONGenerators = {
    math_mul: block => {
        let a = Blockly.JSON.valueToCode(block, 'A', Blockly.JSON.ORDER_MULTIPLICATION) || '0';
        let b = Blockly.JSON.valueToCode(block, 'B', Blockly.JSON.ORDER_MULTIPLICATION) || '0';

        return [a + ' * ' + b, Blockly.JSON.ORDER_MULTIPLICATION];
    },

    math_add: block => {
        let a = Blockly.JSON.valueToCode(block, 'A', Blockly.JSON.ORDER_ADDITION) || '0';
        let b = Blockly.JSON.valueToCode(block, 'B', Blockly.JSON.ORDER_ADDITION) || '0';

        return [a + ' + ' + b, Blockly.JSON.ORDER_SUBTRACTION];
    },

    math_sub: block => {
        let a = Blockly.JSON.valueToCode(block, 'A', Blockly.JSON.ORDER_SUBTRACTION) || '0';
        let b = Blockly.JSON.valueToCode(block, 'B', Blockly.JSON.ORDER_SUBTRACTION) || '0';

        return [a + ' - ' + b, Blockly.JSON.ORDER_SUBTRACTION];
    },

    math_div: block => {
        let a = Blockly.JSON.valueToCode(block, 'A', Blockly.JSON.ORDER_DIVISION) || '0';
        let b = Blockly.JSON.valueToCode(block, 'B', Blockly.JSON.ORDER_DIVISION) || '0';

        return [a + ' / ' + b, Blockly.JSON.ORDER_DIVISION];
    },

    math_mod: block => {
        let a = Blockly.JSON.valueToCode(block, 'A', Blockly.JSON.ORDER_DIVISION) || '0';
        let b = Blockly.JSON.valueToCode(block, 'B', Blockly.JSON.ORDER_DIVISION) || '0';

        return [a + ' % ' + b, Blockly.JSON.ORDER_DIVISION];
    },

    math_number: block => {
        let num = block.getFieldValue('NUM');

        return [num, Blockly.JSON.ORDER_ATOMIC];
    },
};

BlocklyJSONGenerators['math_number_index'] = BlocklyJSONGenerators['math_number'];
BlocklyJSONGenerators['math_number_seconds'] = BlocklyJSONGenerators['math_number'];
BlocklyJSONGenerators['math_number_brightness'] = BlocklyJSONGenerators['math_number'];
BlocklyJSONGenerators['math_number_repeats'] = BlocklyJSONGenerators['math_number'];
BlocklyJSONGenerators['math_number_pwm'] = BlocklyJSONGenerators['math_number'];

export default BlocklyJSONGenerators;