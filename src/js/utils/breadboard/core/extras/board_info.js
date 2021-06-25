import Grid from "../Grid";
import LabelLayer from "../../layers/LabelLayer";
import {boundsToCoordList, buildGrid, pointsToCoordList} from "./helpers";

let ard_plate_ser_num = 0;

function layoutToBoardInfo(layout) {
    const grid = buildGrid(layout);

    let cell_structure = {};
    let embedded_plates = [];

    const {domains} = layout;

    let cell_str_idx = 0;

    let minus_coords_idx = undefined;

    for (const domain of domains) {
        const   from  = grid.cell(domain.from.x, domain.from.y, Grid.BorderTypes.Wrap).idx,
                to    = grid.cell(domain.to.x, domain.to.y, Grid.BorderTypes.Wrap).idx;

        let anal_minus_from, anal_minus_to;
        let is_minus_virtual = false;

        if (domain.minus_from) {
            if (grid.virtualPoint(domain.minus_from.x, domain.minus_from.y)) {
                anal_minus_from = domain.minus_from;
                is_minus_virtual = true;
            } else {
                anal_minus_from = grid.cell(domain.minus_from.x, domain.minus_from.y, Grid.BorderTypes.Wrap).idx;
            }
        }

        if (domain.minus_to) {
            if (grid.virtualPoint(domain.minus_to.x, domain.minus_to.y)) {
                anal_minus_to = domain.minus_to;
                is_minus_virtual = true;
            } else {
                anal_minus_to = grid.cell(domain.minus_to.x, domain.minus_to.y, Grid.BorderTypes.Wrap).idx;
            }
        }

        if (domain.minus) {
            if (grid.virtualPoint(domain.minus.x, domain.minus.y)) {
                anal_minus_from = domain.minus;
                is_minus_virtual = true;
            } else {
                anal_minus_from = grid.cell(domain.minus.x, domain.minus.y, Grid.BorderTypes.Wrap).idx;
            }

            anal_minus_to = anal_minus_from;
        }

        let coords = [];

        let idx_from, idx_to,
            bound_from, bound_to;

        if (domain.horz) {
            idx_from = from.y;      idx_to = to.y;
            bound_from = from.x;    bound_to = to.x;
        } else {
            idx_from = from.x;      idx_to = to.x;
            bound_from = from.y;    bound_to = to.y;
        }

        for (let idx = idx_from; idx <= idx_to; idx++) {
            const idxs_from_begin = idx - idx_from;

            if (domain.horz) {
                // push a list of row-neighbour coordinates
                coords = boundsToCoordList(bound_from, bound_to, null, idx);
            } else {
                coords = boundsToCoordList(bound_from, bound_to, idx, null);
            }

            if (domain.virtual) {
                coords.push(...pointsToCoordList(domain.virtual.from, domain.virtual.to));
            }

            switch(domain.role) {
                case LabelLayer.CellRoles.Analog: {
                    if (!anal_minus_from || !anal_minus_to) {
                        throw Error("Analog domain specified but minus mapping were not provided");
                    }

                    // Map arduino cells to minus cells
                    let anal_minus_map_horz = domain.minus_horz ? domain.minus_horz : domain.horz;
                    // In-domain analog minus coordinates
                    let anal_minus_coords = [];

                    if (anal_minus_map_horz) {
                        anal_minus_coords = boundsToCoordList(
                            anal_minus_from.x, anal_minus_to.x, null, idxs_from_begin + anal_minus_from.y
                        );
                    } else {
                        anal_minus_coords = boundsToCoordList(
                            anal_minus_from.y, anal_minus_to.y, idxs_from_begin + anal_minus_from.x, null
                        );
                    }

                    if (domain.minus) {
                        anal_minus_coords = Array(coords.length).fill(anal_minus_from);
                    }

                    if ((anal_minus_coords.length !== coords.length)) {
                        throw Error("Invalid domain to minus mapping dimensions");
                    }

                    for (let i = 0; i < coords.length; i++) {
                        const coord = coords[i],
                              minus_coord = anal_minus_coords[i];

                        cell_structure[cell_str_idx++] = [coord];
                        embedded_plates.push(getArduinoPinPlate(coord, minus_coord, domain.pin_state_initial));
                    }

                    break;
                }
                case LabelLayer.CellRoles.Plus:
                    cell_structure[cell_str_idx++] = [{x: -1, y: from.y}, ...coords];
                    break;
                case LabelLayer.CellRoles.Minus: {
                    minus_coords_idx = cell_str_idx;
                    cell_structure[cell_str_idx++] = [{x: -1, y: from.y}, ...coords];
                    break;
                }
                default: {
                    cell_structure[cell_str_idx++] = coords;
                }
            }
        }
    }

    const point_minus = grid.auxPoint(Grid.AuxPoints.Gnd),
          point_vcc = grid.auxPoint(Grid.AuxPoints.Vcc);

    if (point_minus && point_vcc) {
        embedded_plates.push(getVoltageSourcePlate(point_minus.idx, point_vcc.idx));
    }

    return {
        cell_struct: cell_structure,
        emb_plates: embedded_plates,
    }
}

function getVoltageSourcePlate(coords_minus, coords_vcc) {
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

function getArduinoPinPlate(arduino_node, minus_node, pin_state_initial) {
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