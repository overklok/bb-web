import { AuxPoint } from "../Grid";
import { XYPoint } from "./types";

export function getSourceLinePath(
    p_gnd: AuxPoint,
    p_vcc: AuxPoint,
    bias: number = 0
): [string, number, number][][] {
    // Point positions corrected to prevent current overlay
    const pos_vcc = { x: p_vcc.pos.x, y: p_vcc.pos.y + 8 },
        pos_gnd = { x: p_gnd.pos.x, y: p_gnd.pos.y - 8 };

    // Top/bottom bias (detailed schematic view only)
    let vcc_cell_pos_x = p_vcc.cell.pos.x,
        gnd_cell_pos_x = p_gnd.cell.pos.x;

    if (bias) {
        vcc_cell_pos_x = p_vcc.cell.center.x;
        gnd_cell_pos_x = p_gnd.cell.center.x;
    }

    const path_vcc: [string, number, number][] = [
        ["M", pos_vcc.x, pos_vcc.y],
        ["L", pos_vcc.x, p_vcc.cell.center.y - bias],
        ["l", vcc_cell_pos_x - pos_vcc.x, 0]
    ];

    const path_gnd: [string, number, number][] = [
        ["M", pos_gnd.x, pos_gnd.y],
        ["L", pos_gnd.x, p_gnd.cell.center.y + bias],
        ["l", gnd_cell_pos_x - pos_gnd.x, 0]
    ];

    return [path_gnd, path_vcc];
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
export function getCursorPoint(
    svg_main: SVGSVGElement,
    clientX: number,
    clientY: number
) {
    let svg_point = svg_main.createSVGPoint();

    svg_point.x = clientX;
    svg_point.y = clientY;

    return svg_point.matrixTransform(svg_main.getScreenCTM().inverse());
}

export function getAbsolutePosition(element: HTMLElement) {
    let absX = 0,
        absY = 0;

    do {
        absX += element.offsetLeft;
        absY += element.offsetTop;

        element = element.offsetParent as HTMLElement;
    } while (element);

    return { x: absX, y: absY };
}
