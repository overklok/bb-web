import Blockly from "blockly";

const controls_if = block => {
    let n = 0;

    let condition_code, branch_code;
    let code = "";

    do {
        condition_code = Blockly.JSON.valueToCode(block, 'IF' + n, Blockly.JSON.ORDER_NONE) || 0;
        branch_code = Blockly.JSON.statementToCode(block, 'DO' + n, false);

        if (n === 0) {
            code += JSON.stringify({
                name: "controls_if",
                block_id: block.id,
                args: [
                    {"value": condition_code, "type": DATATYPES.EXPRSN}
                ]
            });
        }
        else {
            code += JSON.stringify({
                name: "controls_if" + "." + POSTFIXES.ELSE_IF,
                block_id: block.id,
                args: [
                    {"value": condition_code, "type": DATATYPES.EXPRSN}
                ]
            });
        }

        code += "," + branch_code;
        n++;
    } while (block.getInput("IF" + n));

    if (block.getInput("ELSE")) {
        branch_code = Blockly.JSON.statementToCode(block, 'ELSE', false);

        code += JSON.stringify({
            name: "controls_if" + "." + POSTFIXES.ELSE,
            block_id: block.id,
            args: []
        });

        code += "," + branch_code;
    }

    code += JSON.stringify({
        name: "controls_if" + "." + POSTFIXES.END,
        block_id: block.id,
        args: []
    });

    return code + ",";
};

let BlocklyJSONGenerators = {
    controls_if: controls_if,
    controls_ifelse: controls_if,
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