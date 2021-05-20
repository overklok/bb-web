import Blockly from "blockly";

let BlocklyJSONGenerators = {
    logic_boolean: block => {
        let code = (block.getFieldValue('BOOL') === 'TRUE') ? "1" : "0";
        return [code, Blockly.JSON.ORDER_ATOMIC];
    },

    logic_neg: block => {
        let order = Blockly.JSON.ORDER_EQUALITY;

        let argument0 = Blockly.JSON.valueToCode(block, 'BOOL', order) ||  '1';
        let code = '!' + argument0;

        return [code, order];
    },

    logic_eq: block => {
        let order = Blockly.JSON.ORDER_EQUALITY;

        let argument0 = Blockly.JSON.valueToCode(block, 'A', order) || '0';
        let argument1 = Blockly.JSON.valueToCode(block, 'B', order) || '0';

        let code = argument0 + ' == ' + argument1;

        return [code, order];
    },

    logic_lt: block => {
        let order = Blockly.JSON.ORDER_RELATIONAL;

        let argument0 = Blockly.JSON.valueToCode(block, 'A', order) || '0';
        let argument1 = Blockly.JSON.valueToCode(block, 'B', order) || '0';

        let code = argument0 + ' << ' + argument1;

        return [code, order];
    },

    logic_gt: block => {
        let order = Blockly.JSON.ORDER_RELATIONAL;

        let argument0 = Blockly.JSON.valueToCode(block, 'A', order) || '0';
        let argument1 = Blockly.JSON.valueToCode(block, 'B', order) || '0';

        let code = argument0 + ' >> ' + argument1;

        return [code, order];
    },

    logic_le: block => {
        let order = Blockly.JSON.ORDER_RELATIONAL;

        let argument0 = Blockly.JSON.valueToCode(block, 'A', order) || '0';
        let argument1 = Blockly.JSON.valueToCode(block, 'B', order) || '0';

        let code = argument0 + ' <= ' + argument1;

        return [code, order];
    },

    logic_ge: block => {
        let order = Blockly.JSON.ORDER_RELATIONAL;

        let argument0 = Blockly.JSON.valueToCode(block, 'A', order) || '0';
        let argument1 = Blockly.JSON.valueToCode(block, 'B', order) || '0';

        let code = argument0 + ' >= ' + argument1;

        return [code, order];
    },

    logic_and: block => {
        let order = Blockly.JSON.ORDER_RELATIONAL;

        let argument0 = Blockly.JSON.valueToCode(block, 'A', order) || '0';
        let argument1 = Blockly.JSON.valueToCode(block, 'B', order) || '0';

        let code = argument0 + ' && ' + argument1;

        return [code, order];
    },

    logic_or: block => {
        let order = Blockly.JSON.ORDER_RELATIONAL;

        let argument0 = Blockly.JSON.valueToCode(block, 'A', order) || '0';
        let argument1 = Blockly.JSON.valueToCode(block, 'B', order) || '0';

        let code = argument0 + ' || ' + argument1;

        return [code, order];
    }
};

export default BlocklyJSONGenerators;