import SVG from "svg.js";

import Plate, { PlateProps } from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";
import Grid from "../core/Grid";

/**
 * Inductor plate
 *
 * @category Breadboard
 * @subcategory Plates
 */
export default class InductorPlate extends LinearPlate {
    static get Alias() {
        return "inductor";
    }

    static get PROP_INDUCTANCE() {
        return "ind";
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
    }

    protected get __defaultProps__() {
        return {
            ...super["__defaultProps__"],
            [InductorPlate.PROP_INDUCTANCE]: 100
        };
    }

    /**
     * @inheritdoc
     */
    protected __setProps__(props: PlateProps) {
        super.__setProps__(props);

        this._props[InductorPlate.PROP_INDUCTANCE] = Number(
            this._props[InductorPlate.PROP_INDUCTANCE]
        );
    }

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();

        // this._group.text(`Button`).font({size: 20});
    }

    /**
     * Draws an inductor over the plate surface
     *
     * @param qs size of squares
     */
    private _drawPicture(qs = Plate.QuadSizePreferred) {
        let cell1 = this.__grid.getCell(0, 0);
        let cell2 = this.__grid.getCell(
            this._params.size.x - 1,
            this._params.size.y - 1
        );

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);

        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        let line_len = rect2.x() - rect1.x();

        let line_gap = line_len / 4;

        this._group
            .path([
                ["M", 0, 0],
                ["l", line_len / 2 - line_gap, 0],
                ["m", line_gap * 2, 0],
                ["l", line_len / 2 - line_gap, 0]
            ])
            .stroke({ width: 3 })
            .fill("none")
            .move(rect1.cx(), rect1.cy());

        let circ_base_x = rect1.cx() + line_len / 2 - line_gap;

        for (let i = 0; i < 3; i++) {
            // @ts-ignore
            this._group
                .circle(line_gap / 1.5)
                .x(circ_base_x + (line_gap / 1.5) * i)
                .cy(rect1.cy())
                .fill("none")
                .stroke({ width: 3, dasharray: [0, line_gap, line_gap * 1.5] });
        }
    }
}
