import Grid, { BorderType } from "../Grid";
import SVG from "svg.js";
import PlateLayer from "../../layers/PlateLayer";
import defaults from "lodash/defaults";
import { CellRole, Layout, XYObject } from "../types";
import { SerializedPlate } from "../Plate";

/**
 * Performs a modulo division
 * 
 * Native Javascript implementation of `%` operator gives just the remainder instead of the modulo.
 * 
 * @param x     the divident
 * @param base  the divisor
 * 
 * @returns the remainder of `x`/`base` division
 */
export function mod(x: number, base: number): number {
    return ((x % base) + base) % base;
}

/**
 * Applies object's properties over the another object's properties
 * 
 * If the destination object's property exists, its value is taken from the source object if it's defined.
 * Any properties from source object that does not presented in destiation object are ignored.
 * 
 * Note: The destination object can be mutated.
 * 
 * @param d the destination object
 * @param s the source object
 * 
 * @returns the destiantion object
 */
export const coverObjects = (d: any, s: any) => defaults(d, s);

/**
 * Loops over labeled cells in layout config
 *
 * @param layout source board layout
 * @param role domain role to filter by
 *
 * @return generator that loops over labeled cells
 */
export function* extractLabeledCells(layout: Layout, role: CellRole = null) {
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

export function copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
        return classicCopyTextToClipboard(text);
    }
    navigator.clipboard.writeText(text).then(function () {
        return true;
    }, function (err) {
        return classicCopyTextToClipboard(text);
    });
}

export function classicCopyTextToClipboard(text: string) {
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

export function pointsToCoordList(coords_from: XYObject, coords_to: XYObject) {
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

export function boundsToCoordList(from: number, to: number, x_val: number, y_val: number) {
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
 * Gets cursor position in SVG coordinate system
 *
 * @param svg_main    SVG node in whose coordinate system the point is needed
 * @param clientX     X cursor position
 * @param clientY     Y cursor position
 *
 * @returns the point whose coordinates define the position 
 *          of the cursor in the coordinate system of the this SVG node 
 */
export function getCursorPoint(svg_main: SVGSVGElement, clientX: number, clientY: number) {
    let svg_point = svg_main.createSVGPoint();

    svg_point.x = clientX;
    svg_point.y = clientY;

    return svg_point.matrixTransform(svg_main.getScreenCTM().inverse());
}

export function buildGrid(layout: Layout) {
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

export function comparePlates(layout: Layout, plate1: SerializedPlate, plate2: SerializedPlate) {
    const grid = buildGrid(layout);
    const svg = SVG(document.createElement("div"));

    return PlateLayer.comparePlates(svg, grid, plate1, plate2);
}

export function getAbsolutePosition(element: HTMLElement) {
    let absX = 0, 
        absY = 0;

    do {
        absX += element.offsetLeft;
        absY += element.offsetTop;

        element = element.offsetParent as HTMLElement;
    } while ( element )

    return {x: absX, y: absY};
}

export function getRandomInt(min: number, max: number) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}

export function invertHexRGB(hex: string, bw: boolean) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    let r: string|number = parseInt(hex.slice(0, 2), 16),
        g: string|number = parseInt(hex.slice(2, 4), 16),
        b: string|number = parseInt(hex.slice(4, 6), 16);

    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + r.padStart(2, '0') + g.padStart(2, '0') + b.padStart(2, '0');
}
