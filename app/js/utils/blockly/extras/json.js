import Blockly from "node-blockly/browser";

Blockly.JSON = Blockly.JavaScript;

Blockly.JSON.STC = Blockly.JSON.statementToCode;
Blockly.JSON.WTC = Blockly.JSON.workspaceToCode;

Blockly.JSON.workspaceToCode = function (block, name) {
    Blockly.JSON.audible_args = {};

    return Blockly.JSON.WTC(block, name);
};


Blockly.JSON.statementToCode = function(block, name, buffer=false, button=null) {
    if (!buffer) {
        return Blockly.JSON.STC(block, name);
    }

    if (!Blockly.JSON.audible_args) {
        Blockly.JSON.audible_args = {};
    }

    if (button) {
        Blockly.JSON.audible_args[block.id] = {
            code: Blockly.JSON.STC(block, name),
            btn: button
        }
    } else {
        Blockly.JSON.audible_args[block.id] = Blockly.JSON.STC(block, name);
    }

    return "REF";
};

Blockly.JSON.scrubNakedValue = function(line) {
    return '';
};