import SVG from "svg.js";
import Cell from "../core/Cell";
import Grid from "../core/Grid";

import Plate, { PlateProps } from "../core/Plate";
import LinearPlate from "../core/plate/LinearPlate";

/**
 * Transistor plate
 *
 * @category Breadboard
 * @subcategory Plates
 */
export default class TransistorPlate extends LinearPlate {
    static get Alias() {
        return "transistor";
    }

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, schematic, verbose, id, props);

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в кадом измерении)
        this._params.rels = [
            { x: 0, y: 0, adj: { x: 0, y: 0 } },
            { x: 1, y: 0, adj: { x: 0, y: +1 / 3 } },
            { x: 2, y: 0, adj: { x: 0, y: 0 } }
        ];

        // Подгонка позиции плашки для каждой ориентации
        // Единица - размер ячейки (в кадом измерении)
        this._params.adjs = {};
        this._params.adjs[Plate.Orientations.North] = { x: 0, y: 0 };
        this._params.adjs[Plate.Orientations.South] = { x: 0, y: 0 };
    }

    /**
     * @inheritdoc
     */
    protected get __length__() {
        return 3;
    }

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();

        // this._group.text(`Button`).font({size: 20});
    }

    /**
     * Draws a transistor over the plate surface
     *
     * @param {number} qs size of squares
     */
    private _drawPicture(qs = Plate.QuadSizePreferred) {
        let cell1 = this.__grid.getCell(0, 0);
        let cell2 = this.__grid.getCell(1, 0);
        let cell3 = this.__grid.getCell(2, 0);

        // line_top_width
        let ltw = 2;

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);
        let rect3 = this._group.rect(qs, qs);

        rect1.cx(cell1.center_rel.x).cy(cell1.center_rel.y);
        rect2.cx(cell2.center_rel.x).cy(cell2.center_rel.y + qs / 2);
        rect3.cx(cell3.center_rel.x).cy(cell3.center_rel.y);

        let line_len = rect3.x() - rect1.x() - qs * 2;

        let line_gap = line_len / 8;

        let line_top_1 = this._group
            .path([
                ["M", cell1.center_rel.x, cell1.center_rel.y],
                ["l", qs, -qs],
                ["l", line_len / 2 - line_gap, 0],
                ["l", qs / 2, qs / 2]
            ])
            .stroke({ width: ltw })
            .fill("none");

        let line_top_2 = this._group
            .path([
                ["M", cell3.center_rel.x, cell3.center_rel.y],
                ["l", -qs, -qs],
                ["l", -(line_len / 2 - line_gap), 0],
                ["l", -qs / 2, qs / 2]
            ])
            .stroke({ width: ltw })
            .fill("none");

        let line_center = this._group
            .path([
                ["M", 0, 0],
                ["l", line_gap * 4, 0],
                ["M", (line_gap * 4) / 2, 0],
                ["l", 0, qs / 2]
            ])
            .stroke({ width: ltw, color: "#000" })
            .fill("none")
            .x(cell2.center_rel.x - line_gap * 2)
            .y(cell1.center_rel.y - qs / 2);

        this._group
            .polyline([
                [0, 0],
                [qs / 2, 0],
                [qs / 4, -qs / 3],
                [0, 0]
            ])
            .fill("#000")
            .move(
                cell2.rel.x + cell2.size.x / 2 + qs / 3,
                cell2.center_rel.y - qs
            )
            .rotate(45);

        // this._group.line([
        //     ['M', 0, 0],
        //     ['l', line_gap/2, -line_gap/2.2],
        //     ['l', line_gap/4, line_gap/1.5],
        //     ['l', -line_gap/1.35, -line_gap/4],
        // ])
        //     .stroke({width: 1, color: "#000"})
        //     .fill('#000')
        //     .move(rect1.cx() + line_gap*3.2, rect1.cy() + qs/3.6);
        //
        // let line_connector = this._group.polyline([
        //     [0, 0],
        //     [0, qs/1.5],
        //     [qs/2, qs],
        //     [line_gap, qs]
        // ])
        //     .stroke({width: 3})
        //     .fill('none')
        //     .move(rect3.cx(), rect3.cy())
        //     .scale(-1, 1).x(rect3.cx() + line_gap)
    }
}
