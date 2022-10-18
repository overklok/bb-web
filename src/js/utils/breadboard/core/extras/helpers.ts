import defaults from "lodash/defaults";

import Grid, { BorderType } from "../Grid";
import { CellRole, Layout, XYPoint } from "./types";

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
    const grid = new Grid(layout);

    for (const [id, d] of Object.entries(grid.domains)) {
        const { props, field } = d;
        const { from, to } = field;

        if (!props.role) continue;
        if (props.no_labels) continue;

        // filter if filtering role is specified
        if (role !== null && role !== props.role) continue;

        const d_from = grid.getCell(from.x, from.y, BorderType.Wrap).idx,
            d_to = grid.getCell(to.x, to.y, BorderType.Wrap).idx;

        let pin_num = props.pins_to == null ? props.pins_from : props.pins_to,
            pin_dir = props.pins_to == null ? 1 : -1;

        pin_num = pin_num || 0;

        const [d_from_y, d_to_y] = d_from.y > d_to.y ? [d_to.y, d_from.y] : [d_from.y, d_to.y],
            [d_from_x, d_to_x] = d_from.x > d_to.x ? [d_to.x, d_from.x] : [d_from.x, d_to.x];

        for (let row = d_from_y; row <= d_to_y; row++) {
            for (let col = d_from_x; col <= d_to_x; col++) {
                const cell = grid.getCell(col, row);

                const is_analog = props.role === CellRole.Analog;

                yield {
                    cell,
                    role: props.role,
                    label_pos: props.label_pos,
                    value_orientation: props.value_orientation,
                    pin_num: is_analog && pin_num,
                    pin_state_initial: (is_analog && props.pin_state_initial) || 0
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
    navigator.clipboard.writeText(text).then(
        function () {
            return true;
        },
        function (err) {
            return classicCopyTextToClipboard(text);
        }
    );
}

export function classicCopyTextToClipboard(text: string) {
    const input = document.createElement("input");
    input.style.position = "fixed";
    input.style.opacity = "0";
    input.value = text;
    document.body.appendChild(input);
    input.select();
    const success = document.execCommand("Copy");
    document.body.removeChild(input);

    return success;
}

export function* enumerate<T, E extends Generator<T> | T[]>(
    it: E extends Generator<T> ? Generator<T> : T[]
): Generator<[number, T]> {
    if (Array.isArray(it)) {
        for (let i = 0; i < it.length; i++) yield [i, it[i]];
    } else {
        let start = 0;
        for (let x of it) yield [start++, x];
    }
}

export function getRandomInt(min: number, max: number) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}

export function invertHexRgb(hex: string, bw: boolean) {
    if (hex.indexOf("#") === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error("Invalid HEX color.");
    }
    let r: string | number = parseInt(hex.slice(0, 2), 16),
        g: string | number = parseInt(hex.slice(2, 4), 16),
        b: string | number = parseInt(hex.slice(4, 6), 16);

    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + r.padStart(2, "0") + g.padStart(2, "0") + b.padStart(2, "0");
}

/**
 * Converts HSV to RGB color code
 *
 * @param h hue level
 * @param s saturation level
 * @param v value level
 */
export function hsvToRgb(h: number, s: number, v: number) {
    let r, g, b, i, f, p, q, t;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    // prettier-ignore
    switch (i % 6) {
        case 0: [r, g, b] = [v, t, p]; break;
        case 1: [r, g, b] = [q, v, p]; break;
        case 2: [r, g, b] = [p, v, t]; break;
        case 3: [r, g, b] = [p, q, v]; break;
        case 4: [r, g, b] = [t, p, v]; break;
        case 5: [r, g, b] = [v, p, q]; break;
    }

    r = Math.round(r * 255).toString(16);
    g = Math.round(g * 255).toString(16);
    b = Math.round(b * 255).toString(16);

    return "#" + r.padStart(2, "0") + g.padStart(2, "0") + b.padStart(2, "0");
}
