import Blockly from 'node-blockly/browser';

import {getPredef, getArgument, getArguments} from '../_common';

import {DATATYPES, POSTFIXES} from '../constants';

let BlocklyJSONGenerators = {
    event_key: block => {
        return ["event_key", Blockly.JSON.ORDER_ATOMIC]
    },

    /**
     * Генератор не изменяет общий код,
     * а модифицирует объект, содержащий аргументы обработчиков
     *
     * @param block
     */
    event_key_onpush_letter: block => {
        /// извлечь значения аргументов
        let btn     = getArgument(block, "BTN", 81, DATATYPES.NUMBER, false);
        Blockly.JSON.statementToCode(block, "DO", true, btn.value);
    },

    /**
     * Генератор не изменяет общий код,
     * а модифицирует объект, содержащий аргументы обработчиков
     *
     * @param block
     */
    event_key_onpush_number: block => {
        return JSON.stringify({
            name:       "event_key_onpush_number",
            block_id:   block.id,
            args:       getArguments(block, [
                // {name: "BTN", default: 48, datatype: DATATYPES.NUMBER, complex: false},
                {name: "DO", default: "", datatype: DATATYPES.STMBTN, complex: true},
            ])
        }) + ","
    },

    /**
     * Генератор не изменяет общий код,
     * а модифицирует объект, содержащий аргументы обработчиков
     *
     * @param block
     */
    event_key_onpush_any: block => {
        return JSON.stringify({
            name:       "event_key_onpush_any",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "DO", default: "", datatype: DATATYPES.STMBTN, complex: true},
            ])
        }) + ","
    },
};

export default BlocklyJSONGenerators;