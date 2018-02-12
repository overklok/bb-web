import Blockly from "node-blockly/browser";

Blockly.JSON = Blockly.JavaScript;

Blockly.JSON.scrubNakedValue = function(line) {
    return '';
};