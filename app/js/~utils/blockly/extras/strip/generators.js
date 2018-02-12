import Blockly from 'node-blockly/browser';

import {getPredef, getArgument, getArguments} from '../_common';

import {DATATYPES, POSTFIXES} from '../constants';

let BlocklyJSONGenerators = {
    strip_index: block => {
        return ["strip_index", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_colour: block => {
        return ["strip_colour", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_brightness: block => {
        return ["strip_brightness", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_line: block => {
        return ["strip_line", Blockly.JSON.ORDER_ATOMIC]
    },

    strip_colour_string: block => {
        let color = block.getFieldValue("CLR") || "black";

        return [color, Blockly.JSON.ORDER_ATOMIC]
    },

    strip_index_set_number: block => {
        return JSON.stringify({
            name:       "strip_index_set_number",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "IDX", default: 1, datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },

    strip_index_inc_one: block => {
        return JSON.stringify({
            name:       "strip_index_inc_one",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_index_dec_one: block => {
        return JSON.stringify({
            name:       "strip_index_dec_one",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_index_set_rand: block => {
        return JSON.stringify({
            name:       "strip_index_set_rand",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "IDX_FROM",  default: 1, datatype: DATATYPES.NUMBER, complex: true},
                {name: "IDX_TO",    default: 1, datatype: DATATYPES.NUMBER, complex: true},
            ])
        }) + ","
    },

    strip_colour_set_string: block => {
        return JSON.stringify({
            name:       "strip_colour_set_string",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "CLR", default: "black", datatype: DATATYPES.STRING, complex: true}
            ])
        }) + ","
    },

    strip_colour_set_off: block => {
        return JSON.stringify({
            name:       "strip_colour_set_off",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_colour_chn_inc: block => {
        return JSON.stringify({
            name:       "strip_colour_chn_inc",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "BRT",       default: 0,     datatype: DATATYPES.NUMBER, complex: true},
                {name: "CLRCHN",    default: "red", datatype: DATATYPES.STRING, complex: false},
            ])
        }) + ","
    },

    strip_colour_chn_dec: block => {
        return JSON.stringify({
            name:       "strip_colour_chn_dec",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "BRT",       default: 0,     datatype: DATATYPES.NUMBER, complex: true},
                {name: "CLRCHN",    default: "red", datatype: DATATYPES.STRING, complex: false},
            ])
        }) + ","
    },

    strip_colour_set_rand_string: block => {
        return JSON.stringify({
            name:       "strip_colour_set_rand_string",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_colour_set_rand_number: block => {
        return JSON.stringify({
            name:       "strip_colour_set_rand_number",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_colour_current_chn_inc: block => {
        return JSON.stringify({
            name:       "strip_colour_current_chn_inc",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "CLRCHN", default: "red", datatype: DATATYPES.STRING, complex: false}
            ])
        }) + ","
    },

    strip_colour_current_chn_dec: block => {
        return JSON.stringify({
            name:       "strip_colour_current_chn_dec",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "CLRCHN", default: "red", datatype: DATATYPES.STRING, complex: false}
            ])
        }) + ","
    },

    strip_colour_current_set_line: block => {
        return JSON.stringify({
            name:       "strip_colour_current_set_line",
            block_id:   block.id,
            args:       getArguments(block, [])
        }) + ","
    },

    strip_brightness_set_number: block => {
        return JSON.stringify({
            name:       "strip_brightness_set_number",
            block_id:   block.id,
            args:       getArguments(block, [
                {name: "BRT", default: 0, datatype: DATATYPES.NUMBER, complex: true}
            ])
        }) + ","
    },

    strip_brightness_set_rand: block => {
        return JSON.stringify({
            name:       "strip_brightness_set_rand",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_line_set_off: block => {
        return JSON.stringify({
            name:       "strip_line_set_off",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_line_set_rand: block => {
        return JSON.stringify({
            name:       "strip_line_set_rand",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_current_color: block => {
        return JSON.stringify({
            name:       "strip_emit_current_color",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_all_off: block => {
        return JSON.stringify({
            name:       "strip_emit_all_off",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_all_colour: block => {
        return JSON.stringify({
            name:       "strip_emit_all_colour",
            block_id:   block.id,
            args:       []
        }) + ","
    },

    strip_emit_all_list: block => {
        return JSON.stringify({
            name:       "strip_emit_all_list",
            block_id:   block.id,
            args:       []
        }) + ","
    }
};

export default BlocklyJSONGenerators;