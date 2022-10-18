import SVG from "svg.js";
import Cell from "../core/Cell";
import Grid from "../core/Grid";

import Plate, { PlateProps } from "../core/Plate";
import ButtonPlate from "./ButtonPlate";

/**
 * Switch plate
 *
 * @category Breadboard
 * @subcategory Plates
 */
export default class SwitchPlate extends ButtonPlate {
    static get Alias() {
        return "switch";
    }

    private jumper_on: SVG.Path;
    private jumper_off: SVG.Path;

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, schematic, verbose, id, props);

        this._params.size = { x: 3, y: 2 };

        this._params.surface = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 }
        ];

        this._params.origin = { x: 0, y: 0 };
    }

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();

        if (this._params.verbose) {
            this._redrawInput(this._state.input);
        }

        // this._group.text(`Switch`).font({size: 20});
    }

    /**
     * @inheritdoc
     */
    protected _toggleJumper() {
        if (this.state.input) {
            this.jumper_off.hide();
            this.jumper_on.show();
        } else {
            this.jumper_off.show();
            this.jumper_on.hide();
        }
    }

    /**
     * Draws a switch over the plate surface
     *
     * @param {number} qs size of squares
     */
    protected _drawPicture(qs = Plate.QuadSizePreferred) {
        let cell1 = this.__grid.getCell(0, 0);
        let cell2 = this.__grid.getCell(2, 0);
        let cell3 = this.__grid.getCell(1, 1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);
        let rect3 = this._group.rect(qs, qs);

        rect1.cx(cell1.center_rel.x).cy(cell1.center_rel.y);
        rect2.cx(cell2.center_rel.x).cy(cell2.center_rel.y);
        rect3.cx(cell3.center_rel.x).cy(cell3.center_rel.y);

        let contact_point = {
            x: cell3.center_rel.x,
            y: cell1.rel.y + cell1.size.y
        };

        let line_right = this._group.path([
            ["M", cell1.center_rel.x, cell1.center_rel.y],
            ["H", cell3.rel.x]
        ]);

        let line_left = this._group.path([
            ["M", cell2.center_rel.x, cell2.center_rel.y],
            ["H", cell3.rel.x + cell3.size.x]
        ]);

        let line_middle = this._group.path([
            ["M", cell3.center_rel.x, cell3.center_rel.y],
            ["V", contact_point.y]
        ]);

        this.jumper_off = this._group.path([
            ["M", cell3.center_rel.x, cell3.center_rel.y],
            ["L", contact_point.x, contact_point.y],
            ["L", cell1.center_rel.x + cell1.size.x, cell1.center_rel.y],
            ["L", cell1.center_rel.x, cell1.center_rel.y]
        ]);

        this.jumper_on = this._group.path([
            ["M", cell3.center_rel.x, cell3.center_rel.y],
            ["L", contact_point.x, contact_point.y],
            ["L", cell2.center_rel.x - cell2.size.x, cell2.center_rel.y],
            ["L", cell2.center_rel.x, cell2.center_rel.y]
        ]);

        line_right.stroke({ width: 3 }).fill("none");
        line_left.stroke({ width: 3 }).fill("none");
        line_middle.stroke({ width: 3 }).fill("none");
        this.jumper_off.stroke({ width: 3 }).fill("none");
        this.jumper_on.stroke({ width: 3 }).fill("none");

        this._toggleJumper();
    }
}
