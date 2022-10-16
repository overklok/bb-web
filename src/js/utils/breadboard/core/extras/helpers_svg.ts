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
