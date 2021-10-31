import SVG from 'svg.js'
import Cell from '../core/Cell';

import Grid from '../core/Grid';
import Plate, { PlateProps } from "../core/Plate";

/**
 * Dummy plate
 * 
 * @category Breadboard
 * @subcategory Plates
 */
export default class DummyPlate extends Plate {
    static get Alias() {return "dummy"}

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, false, verbose, id, props);

        this._params.size = {x: 1, y: 1};
    }

    public deselect() {
        super.deselect();

        this._bezel.stroke({color: "none", opacity: 0});
    }

    /**
     * Draws a plate without a bezel
     */
    protected __draw__(position: Cell, orientation: string) {
        this._bezel.fill("none").stroke({color: "none", opacity: 0});

        this._drawPicture();
    };

    /**
     * Draws an animated dot 
     *
     * @param qs size of the dot
     */
    private _drawPicture(qs=Plate.QuadSizePreferred) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, 0);

        let center_x = cell1.center_rel.x + (cell2.pos.x - cell1.pos.x) / 2;
        let center_y = cell1.center_rel.y;

        const radius = qs * 1.5;

        const dot = this._group.circle(radius)
            .center(
                center_x,
                center_y
            )
            .fill('#ff3a47');

        (dot.animate(1200) as any).radius(0).loop();
    }
}