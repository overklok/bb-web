import Grid, { BorderType } from "../Grid";
import SVG from "svg.js";
import PlateLayer from "../../layers/PlateLayer";
import defaults from "lodash/defaults";
import { CellRole } from "../types";

export function mod(x, base) {
    return ((x % base) + base) % base;
}

export const coverObjects = (o, d) => defaults(o, d);

/**
 * Loop over labeled cells in layout config
 *
 * @param layout source board layout
 * @param role domain role to filter by
 *
 * @return {Generator<{
 *              cell: Cell,
 *              role: string,
 *              label_pos: string,
 *              value_orientation: string,
 *              pin_num: (number|undefined),
 *              pin_state_initial: (string|number|undefined)
 *          }>}
 */
export function* extractLabeledCells(layout, role=null) {
    const grid = buildGrid(layout);

    for (const domain of layout.domains) {
        if (domain.no_labels) continue;
        if (!domain.role) continue;

        // filter if filtering role is specified
        if (role !== null && role !== domain.role) continue;

        const d_from = grid.cell(domain.from.x, domain.from.y, BorderType.Wrap).idx,
              d_to   = grid.cell(domain.to.x, domain.to.y, BorderType.Wrap).idx;

        let pin_num = (domain.pins_to == null) ? domain.pins_from : domain.pins_to,
            pin_dir = (domain.pins_to == null) ? 1 : -1;

        pin_num = pin_num || 0;

        const [d_from_y, d_to_y] = d_from.y > d_to.y ? [d_to.y, d_from.y] : [d_from.y, d_to.y],
              [d_from_x, d_to_x] = d_from.x > d_to.x ? [d_to.x, d_from.x] : [d_from.x, d_to.x];

        for (let row = d_from_y; row <= d_to_y; row++) {
            for (let col = d_from_x; col <= d_to_x; col++) {
                const cell = grid.cell(col, row);

                const is_analog = domain.role === CellRole.Analog;

                yield {
                    cell,
                    role: domain.role,
                    label_pos: domain.label_pos,
                    value_orientation: domain.value_orientation,
                    pin_num: is_analog && pin_num,
                    pin_state_initial: is_analog && domain.pin_state_initial || 0
                };

                pin_num += pin_dir;
            }
        }
    }
}

export function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        return classicCopyTextToClipboard(text);
    }
    navigator.clipboard.writeText(text).then(function () {
        return true;
    }, function (err) {
        return classicCopyTextToClipboard(text);
    });
}

export function classicCopyTextToClipboard(text) {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    const success = document.execCommand('Copy');
    document.body.removeChild(input);

    return success;
}

export function pointsToCoordList(coords_from, coords_to) {
    let x_val = null,
        y_val = null;

    let from, to;

    if (coords_from.x === coords_to.x) {
        x_val = coords_from.x;
        from = coords_from.y;
        to = coords_to.y;
    }

    if (coords_from.y === coords_to.y) {
        y_val = coords_from.y;
        from = coords_from.x;
        to = coords_to.x;
    }

    return boundsToCoordList(from, to, x_val, y_val);
}

export function boundsToCoordList(from, to, x_val, y_val) {
    if (x_val != null && y_val != null) {
        throw Error("Only one of the dimensions might be fixed");
    }

    if (x_val == null && y_val == null) {
        throw Error("One of the dimensions should be fixed");
    }

    let is_inversed = false;

    if (from > to) {
        [from, to] = [to, from];
        is_inversed = true;
    }

    const list = [];

    for (let i = from; i <= to; i++) {
        let item = x_val != null ? {x: x_val, y: i} : {x: i, y: y_val};

        if (is_inversed) {
            list.unshift(item);
        } else {
            list.push(item);
        }
    }

    return list;
}

/**
 * Получить положение курсора в системе координат SVG
 *
 * @param {SVGSVGElement}   svg_main    SVG-узел, в системе координат которого нужна точка
 * @param {number}          clientX     Положение курсора по оси X
 * @param {number}          clientY     Положение курсора по оси Y
 *
 * @returns {SVGPoint}  точка, координаты которой определяют положение курсора
 *                      в системе координат заданного SVG-узла
 */
export function getCursorPoint(svg_main, clientX, clientY) {
    let svg_point = svg_main.createSVGPoint();

    svg_point.x = clientX;
    svg_point.y = clientY;

    return svg_point.matrixTransform(svg_main.getScreenCTM().inverse());
}

export function buildGrid(layout) {
    return new Grid(
        layout.grid_rows,  layout.grid_cols,
        layout.grid_width, layout.grid_height,
        layout.grid_pos_x, layout.grid_pos_y,
        layout.grid_gap_x, layout.grid_gap_y,
        layout.wrap_width, layout.wrap_height,
        layout.points,
        layout.domains,
        layout.curr_straight_top_y,
        layout.curr_straight_bottom_y,
    );
}

export function comparePlates(layout, plate1, plate2) {
    const grid = buildGrid(layout);
    const svg = SVG(document.createElement("div"));

    return PlateLayer.comparePlates(svg, grid, plate1, plate2);
}

export function getAbsolutePosition(element) {
    let absX = 0,
        absY = 0;

    do {
        absX += element.offsetLeft;
        absY += element.offsetTop;

        element = element.offsetParent;
    } while ( element )

    return {x: absX, y: absY};
}