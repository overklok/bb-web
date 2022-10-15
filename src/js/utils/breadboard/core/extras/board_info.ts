import { AuxPoint, AuxPointType, BorderType } from "../Grid";
import { buildGrid } from "./helpers";
import { CellRole, Layout, PinState, XYObject } from "../types";

let ard_plate_ser_num = 0;

export type BoardInfo = {
    cell_struct: { [line_id: number]: XYObject[] },
    emb_plates: any
}

/**
 * Convert generic board config to core-specific format
 * 
 * For core, it's required to specify only the topology and some electrical properties.
 * 
 * Whereas the generic format is mostly visual-oriented, some overhead required to perform such a
 * conversion so the code here may seem confusing.
 * 
 * TODO: Refactor in pair with the config format
 * 
 * @param layout                generic board config (layout)
 * @param no_arduino_embedded   whether to exclude arduino pin functionalty (specifically for board verification)
 * 
 * @returns board config in core-specific format
 * 
 * @category Breadboard
 */
function layoutToBoardInfo(layout: Layout, no_arduino_embedded=false): BoardInfo {
    return {cell_struct: {}, emb_plates: []};
}

function getVoltageSourcePlate(coords_minus: XYObject, coords_vcc: XYObject) {
    return {
        type: 'Vss',
        id: -100,
        position: {
            cells: [
                coords_minus,
                coords_vcc,
            ]
        },
        properties: {
            volt: 5
        }
    }
}

function getArduinoPinPlate(arduino_node: XYObject, minus_node: XYObject, pin_state_initial: PinState) {
    return {
        type: 'ard_pin',
        id: -101 - ard_plate_ser_num++,
        position: {
            cells: [
                {x: arduino_node.x, y: arduino_node.y},
                {x: minus_node.x, y: minus_node.y}
            ]
        },
        properties: {
            volt: 5,
            analogue_max_value: 100
        },
        pin_state_initial
    };
}



export {layoutToBoardInfo}