import { ElectronicEvent } from "src/js/models/common/BoardModel";
import { AuxPoint, AuxPointType } from "../Grid";
import { enumerate } from "./helpers";
import { isDomainAnalog } from "./helpers_data";
import { pointseq, rangeOrPointToRange } from "./helpers_point";
import { CellRole, Domain, DomainTable, PinState, XYPoint } from "./types";

export type EmbeddedPlate = {
    type: string;
    id: number;
    position: {
        cells: XYPoint[];
    };
    properties: { [key: string]: string | number };
    pin_state_initial?: PinState;
};

export type CellStruct = {
    [line_id: string]: XYPoint[];
};

export type ElecLayout = {
    emb_plates: EmbeddedPlate[];
    cell_struct: CellStruct;
};

export function _scanDomains(domains: [string, Domain][]): [CellStruct, string, string] {
    const cell_struct: CellStruct = {};

    let id_plus, id_minus;

    // scan non-analog domains
    for (const [d_id, d] of domains) {
        const field = rangeOrPointToRange(d.field);
        // generate scanning of the range
        const points = [...pointseq(field)];
        // add scanning of the virtual range if exists
        d.virtual && points.push(...pointseq(d.virtual));

        // find line of plus and minus
        if (d.props.role === CellRole.Plus) {
            id_plus = d_id;
            points.unshift({ x: -1, y: d.field.from.y });
        }
        if (d.props.role === CellRole.Minus) {
            id_minus = d_id;
            points.unshift({ x: -1, y: d.field.from.y });
        }

        if (d.props.role in [CellRole.Minus, CellRole.Plus]) {
            points.unshift({ x: -1, y: field.from.y });
        }

        cell_struct[d_id] = points;
    }

    return [cell_struct, id_plus, id_minus];
}

export function _scanAnalogDomains(
    domains: [string, Domain][],
    embed_arduino = true,
    id_plus: string,
    id_minus: string
): [CellStruct, EmbeddedPlate[]] {
    const cell_struct: CellStruct = {};
    const emb_plates: EmbeddedPlate[] = [];

    let id_analog = 0;

    for (const [d_id, d] of domains) {
        const field = rangeOrPointToRange(d.field);
        // generate scanning of the range
        const points = [...pointseq(field)];

        for (const [p_id, point] of enumerate(points)) {
            const p_id_liter = "abcedf"[p_id];

            if (embed_arduino) {
                cell_struct[`${d_id}${p_id_liter}`] = [point];

                emb_plates.push(
                    getArduinoPinPlate(point, d.minus(p_id, point), d.props.pin_state_initial, id_analog++)
                );
            } else {
                if (d.props.pin_state_initial === PinState.Output) {
                    cell_struct[id_minus].push(point);
                }

                if (d.props.pin_state_initial === PinState.Input) {
                    cell_struct[id_plus].push(point);
                }
            }
        }
    }

    return [cell_struct, emb_plates];
}

function getVoltageSourcePlate(coords_minus: XYPoint, coords_vcc: XYPoint): EmbeddedPlate {
    return {
        type: "Vss",
        id: -100,
        position: {
            cells: [coords_minus, coords_vcc]
        },
        properties: {
            volt: 5
        }
    };
}

function getArduinoPinPlate(
    arduino_node: XYPoint,
    minus_node: XYPoint,
    pin_state_initial: PinState,
    ard_plate_ser_num: number
): EmbeddedPlate {
    return {
        type: "ard_pin",
        id: -101 - ard_plate_ser_num++,
        position: {
            cells: [
                { x: arduino_node.x, y: arduino_node.y },
                { x: minus_node.x, y: minus_node.y }
            ]
        },
        properties: {
            volt: 5,
            analogue_max_value: 100
        },
        pin_state_initial
    };
}
