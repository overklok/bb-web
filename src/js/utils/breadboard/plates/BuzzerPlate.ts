import SVG from 'svg.js'

import Plate, { PlateProps } from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";
import Grid from '../core/Grid';

/**
 * Buzzer plate
 * 
 * @category Breadboard
 */
export default class BuzzerPlate extends LinearPlate {
    static get Alias() {return "buzzer"}

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

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();
    };

    /**
     * Draws a buzzer over the plate surface
     *
     * @param qs size of squares
     */
    private _drawPicture(qs=Plate.QuadSizePreferred) {
        let ls = this._params.schematic ? 10 : 6;

        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);

        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        this._group.rect(rect2.x() - rect1.x(), ls)
            .x(cell1.center_rel.x)
            .cy(cell1.center_rel.y);

        const cx = cell1.center_rel.x + (cell2.center_rel.x - cell1.center_rel.x) / 2,
            cy = cell1.center_rel.y;

        this._group.circle(qs*2).center(cx, cy).fill({color: 'black'});
        this._group.circle(qs/3).center(cx, cy).fill({color: 'white'});
    }
}