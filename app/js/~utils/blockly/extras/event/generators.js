import Blockly from 'node-blockly/browser';

import {getPredef, getArgument, getArguments} from '../_common';

import {DATATYPES, POSTFIXES} from '../constants';

let BlocklyJSONGenerators = {
    event_key: block => {
        return ["event_key", Blockly.JSON.ORDER_ATOMIC]
    },

    event_key_onpush_letter: block => {
        return JSON.stringify({
            name:       "event_key_onpush_letter",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "BTN", default: 81, datatype: DATATYPES.NUMBER, complex: false},
                {name: "DO", default: "", datatype: DATATYPES.STATMT, complex: false},
            ])
        }) + ","
    },
};

export default BlocklyJSONGenerators;