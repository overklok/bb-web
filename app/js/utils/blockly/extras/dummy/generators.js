import Blockly from "blockly";
import {DATATYPES} from "../constants";
import {getArguments} from "../_common";

let DummyJSONGenerators = {
    dummy_1: block => {
        return ["dummy_out_value_1", Blockly.JSON.ORDER_ATOMIC]
    },

    dummy_2: block => {
        return ["dummy_out_value_2", Blockly.JSON.ORDER_ATOMIC]
    },

    set_dummy: block => {
        return JSON.stringify({
            name:       "var_out_write",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "VAR", default: 'dummy_out_value_1',   datatype: DATATYPES.STRING, complex: true},
                {name: "VAL", default: 0,                     datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },
};

export default DummyJSONGenerators;