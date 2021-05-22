import Grid from "../Grid";
import SVG from "svg.js";
import PlateLayer from "../../layers/PlateLayer";
import merge from "lodash/merge";

export const coverObjects = (o, d) => merge(d, o);

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