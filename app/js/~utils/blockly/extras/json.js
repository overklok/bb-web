import Blockly from "node-blockly/browser";

Blockly.JSON = Blockly.JavaScript;

Blockly.JSON.STC = Blockly.JSON.statementToCode;
Blockly.JSON.WTC = Blockly.JSON.workspaceToCode;

Blockly.JSON.workspaceToCode = function (block, name) {
    Blockly.JSON.statements = [];

    return Blockly.JSON.WTC(block, name);
};

Blockly.JSON.statementToCode = function(block, name) {

    if (!Blockly.JSON.statements) {
        Blockly.JSON.statements = [];
    }

    Blockly.JSON.statements.push(Blockly.JSON.STC(block, name));

    return Blockly.JSON.statements.length - 1;
};

Blockly.JSON.scrubNakedValue = function(line) {
    return '';
};