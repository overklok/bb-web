import Grid from "../Grid";
import Breadboard from "../../Breadboard";
import LabelLayer from "../../layers/LabelLayer";

let ard_plate_ser_num = 0;

function layoutToBoardInfo(layout) {
    const grid = Breadboard.buildGrid(layout);

    let cell_structure = {};
    let embedded_plates = [];

    const {domains, points, grid_rows, grid_cols} = layout;

    let cell_str_idx = 0;

    let arduino_nodes = [];

    for (const domain of domains) {
        const   from  = grid.cell(domain.from.x, domain.from.y, Grid.BorderTypes.Wrap).idx,
                to    = grid.cell(domain.to.x, domain.to.y, Grid.BorderTypes.Wrap).idx;

        let minus_from, minus_to;

        if (domain.minus_from) {
            minus_from = grid.cell(domain.minus_from.x, domain.minus_from.y, Grid.BorderTypes.Wrap).idx;
        }

        if (domain.minus_to) {
            minus_to = grid.cell(domain.minus_to.x, domain.minus_to.y, Grid.BorderTypes.Wrap).idx;
        }

        if (domain.minus) {
            minus_from = grid.cell(domain.minus.x, domain.minus.y, Grid.BorderTypes.Wrap).idx;
            minus_to = minus_from;
        }

        let coords;

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

            if (!coords) continue;

            switch(domain.role) {
                case LabelLayer.CellRoles.Analog: {
                    if (!minus_from || !minus_to) {
                        throw Error("Analog domain specified but minus mapping were not provided");
                    }

                    // Map arduino cells to minus cells
                    let minus_map_horz = domain.minus_horz ? domain.minus_horz : domain.horz;
                    let minus_coords = [];

                    if (minus_map_horz) {
                        minus_coords = boundsToCoordList(
                            minus_from.x, minus_to.x, null, idxs_from_begin + minus_from.y
                        );
                    } else {
                        minus_coords = boundsToCoordList(
                            minus_from.y, minus_to.y, idxs_from_begin + minus_from.x, null
                        );
                    }

                    if (domain.minus) {
                        minus_coords = Array(coords.length).fill(minus_from);
                    }

                    if ((minus_coords.length !== coords.length)) {
                        throw Error("Invalid domain to minus mapping dimensions");
                    }

                    for (let i = 0; i < coords.length; i++) {
                        const coord = coords[i],
                              minus_coord = minus_coords[i];

                        cell_structure[cell_str_idx++] = [coord];
                        arduino_nodes.push(coord);
                        embedded_plates.push(getArduinoPinPlate(coord, minus_coord));
                    }

                    break;
                }
                case LabelLayer.CellRoles.Plus:
                    cell_structure[cell_str_idx++] = ([{x: -1, y: from.y}, ...coords]);
                    break;
                case LabelLayer.CellRoles.Minus: {
                    cell_structure[cell_str_idx++] = ([{x: -1, y: from.y}, ...coords]);
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

function getArduinoPinPlate(arduino_node, minus_node) {
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
        }
    };
}

function boundsToCoordList(from, to, x_val, y_val) {
    if (x_val != null && y_val != null) {
        throw Error("Only one of the dimensions might be fixed");
    }

    if (x_val == null && y_val == null) {
        throw Error("One of the dimensions should be fixed");
    }

    const list = [];

    for (let i = from; i <= to; i++) {
        if (x_val != null) {
            list.push({x: x_val, y: i});
        } else if (y_val != null) {
            list.push({x: i, y: y_val});
        }
    }

    return list;
}

export {layoutToBoardInfo}