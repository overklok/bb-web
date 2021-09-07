import Blockly from "blockly";

import {DATATYPES} from "./constants";

/**
 * Получить аргумент с предопределённым значением
 *
 * @param value     значение
 * @param datatype  тип данных аргумента
 * @returns {{value: *, datatype: *}}   аргумент
 */
let getPredef = (value, datatype) => {
    return {
        value: value,
        type: datatype
    }
};

/**
 * Получить аргумент в заданном блоке
 *
 * Для сложных полей тип данных аргумента может изменяться, если
 * поле содержит арифметическое выражение
 *
 * @param block             блок Blockly
 * @param field_name        название поля
 * @param default_value     значение аргумента по умолчанию
 * @param datatype          предполагаемый тип данных аргумента
 * @param complex           является ли поле сложным
 * @returns {{value: *, type: *}}   аргумент
 */
let getArgument = (block, field_name, default_value, datatype, complex) => {
    let arg = {
        value: default_value,
        type: datatype
    };

    if (block.getField(field_name)) {
        // Internal number
        if (datatype === DATATYPES.NUMBER) {
            // arg.value = String(Number(block.getFieldValue(field_name)));
            arg.value = parseInt(block.getFieldValue(field_name));
        }

        if (datatype === DATATYPES.STRING) {
            arg.value = block.getFieldValue(field_name);
        }
    } else if (complex) {
        // External number
        if (datatype === DATATYPES.STATMT) {
            arg.value = Blockly.JSON.statementToCode(block, field_name, true);
        } else {
            arg.value = Blockly.JSON.valueToCode(block, field_name, Blockly.JavaScript.ORDER_ATOMIC) || default_value;
            arg.type = DATATYPES.EXPRSN;
        }
    }

    return arg;
};

/**
 * Получить массив аргументов по заданному массиву полей
 *
 * @param block
 * @param fields
 * @returns {Array}
 */
let getArguments = (block, fields) => {
    let args = [];

    for (let field of fields) {
        args.push(getArgument(block, field.name, field.default, field.datatype, field.complex));
    }

    return args;
};

/**
 * @param {BlockSvg} block_svg      block that should contain a shadow block
 * @param {string} input_name       name of the argument related with shadow block
 * @param {string} block_name       name of the block to be appended
 */
let appendShadowBlock = (block_svg, input_name, block_name) => {
    // UNCOMMENT THESE LINES IF WANTED TO USE NEW BLOCKLY VERSIONS ("node-blockly": "^1.0.31")
    // setTimeout(() => {
        let numberShadowBlock = block_svg.workspace.newBlock(block_name);

        numberShadowBlock.setShadow(true);
        numberShadowBlock.initSvg();

        numberShadowBlock.render();

        let ob = numberShadowBlock.outputConnection;

        let cc = block_svg.getInput(input_name).connection;
        cc.connect(ob);
    // }, 600);
};

export {
    getPredef,
    getArgument,
    getArguments,
    appendShadowBlock
}