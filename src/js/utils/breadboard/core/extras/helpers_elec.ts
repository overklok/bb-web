import { idText } from "typescript";
import { enumerate } from "./helpers";
import { isDomainAnalog } from "./helpers_data";
import { pointseq, rangeOrPointToRange } from "./helpers_point";
import {
    CellRole,
    Domain,
    DomainTable,
    ElecLineTable,
    Line,
    LineTable,
    PinState,
    XYPoint
} from "./types";

export type EmbeddedPlate = {
    type: string;
    id: number;
    position: {
        cells: XYPoint[];
    };
    properties: { [key: string]: string | number };
    pin_state_initial?: PinState;
};

export type ElecLayout = {
    emb_plates: EmbeddedPlate[];
    cell_struct: ElecLineTable;
};

export function extractAnalogPoints(
    lines: LineTable,
    pin_state: PinState
): XYPoint[] {
    // prettier-ignore
    return Object.values(lines).filter(
        // take analog lines only
        line => (
            line.role === CellRole.Analog && 
            line.pin_state_initial === pin_state
        )
    ).map(
        // take only points from them
        line => line.points
    ).reduce(
        // join all points to single array
        (prev, next) => prev.concat(next)
    );
}

export function scanDomains(domains: DomainTable): LineTable {
    const ds = Object.entries(domains);

    let lines: LineTable = {};

    // scan non-analog domains
    for (const [d_id, d] of ds) {
        if (d.props.role === CellRole.Analog) {
            lines = { ...lines, ...scanDomainAnalog(d, d_id) };
        } else {
            lines = { ...lines, ...scanDomain(d, d_id) };
        }
    }

    return lines;
}

function scanDomain(d: Domain, d_id: string): LineTable {
    let line_id = d_id;

    const field = rangeOrPointToRange(d.field);
    // generate scanning of the range
    const points = [...pointseq(field)];
    // add scanning of the virtual range if exists
    d.virtual && points.push(...pointseq(d.virtual));

    // find line of plus and minus
    if (d.props.role === CellRole.Plus) {
        points.unshift({ x: -1, y: d.field.from.y });
        line_id = `p${d_id}`;
    }
    if (d.props.role === CellRole.Minus) {
        points.unshift({ x: -1, y: d.field.from.y });
        line_id = `m${d_id}`;
    }

    if (d.props.role in [CellRole.Minus, CellRole.Plus]) {
        points.unshift({ x: -1, y: field.from.y });
    }

    return { [line_id]: { points, role: d.props.role, field: d.field } };
}

function scanDomainAnalog(d: Domain, d_id: string): LineTable {
    const lines: LineTable = {};

    let id_analog = 0;

    const field = rangeOrPointToRange(d.field);
    // generate scanning of the range
    const points = [...pointseq(field)];

    for (const [p_id, point] of enumerate(points)) {
        lines[`${d_id}.${p_id}`] = {
            points: [point],
            role: d.props.role,
            pin_state_initial: d.props.pin_state_initial,
            field: rangeOrPointToRange(point),
            embedded_plate: getArduinoPinPlate(
                point,
                d.minus(p_id, point),
                d.props.pin_state_initial,
                id_analog++
            )
        };
    }

    return lines;
}

function getVoltageSourcePlate(
    coords_minus: XYPoint,
    coords_vcc: XYPoint
): EmbeddedPlate {
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
