import Blockly from 'blockly';

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

        return '';
    },

    /**
     * Генератор не изменяет общий код,
     * а модифицирует объект, содержащий аргументы обработчиков
     *
     * @param block
     */
    event_key_onpush_number: block => {
        /// извлечь значения аргументов
        let btn     = getArgument(block, "BTN", 48, DATATYPES.NUMBER, false);
        Blockly.JSON.statementToCode(block, "DO", true, btn.value);

        return '';
    },

    /**
     * Генератор не изменяет общий код,
     * а модифицирует объект, содержащий аргументы обработчиков
     *
     * @param block
     */
    event_key_onpush_any: block => {
        /// извлечь значения аргументов
        Blockly.JSON.statementToCode(block, "DO", true);

        return '';
    },

    /**
     * Генератор не изменяет общий код,
     * а модифицирует объект, содержащий аргументы обработчиков
     *
     * @param block
     */
    event_key_onpush_any_number: block => {
        /// извлечь значения аргументов
        Blockly.JSON.statementToCode(block, "DO", true);

        return '';
    },
};

export default BlocklyJSONGenerators;