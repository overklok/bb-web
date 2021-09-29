import SVG from "svg.js";

import LinearPlate from "../core/plate/LinearPlate";
import Plate, { PlateProps } from "../core/Plate";
import Grid from "../core/Grid";
import Cell from "../core/Cell";

/**
 * Motor plate
 * 
 * @category Breadboard
 */
export default class MotorPlate extends LinearPlate {
    static get Alias() {return "motor"}

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, schematic, verbose, id, props);

        this._params.size = {x: 2, y: 1};
    }

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();
        // this._drawLabel('мотор', 40);

        // this._group.text(`Diode ${this._params.colour}`).font({size: 20});
    };

    /**
     * Draws a motor over the plate surface
     */
    private _drawPicture(qs=Plate.QuadSizePreferred) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);

        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        let line_len = rect2.x() - rect1.x();

        this._group.polyline([
            [0, 0],
            [line_len, 0]
        ])
            .stroke({width: 1})
            .fill('none')
            .move(rect1.cx(), rect1.cy());

        let center_x = cell1.center_rel.x + (cell2.pos.x - cell1.pos.x) / 2;
        let center_y = cell1.center_rel.y;

        this._group.circle(cell1.size.y/1.25)
            .center(
                center_x,
                center_y
            )
            .fill('#ffffff')
            .stroke({width: 1});

        this._group.text('M')
            .font({
                size: 22,
                weight: 'bold',
                family: "monospace",
                anchor: "start"
            })
            .center(center_x, center_y - 5);

        this._group.line(center_x - 10, center_y + 7, center_x + 10, center_y + 7)
            .stroke({width: 2})
            .fill('none');

        this._group.line(center_x - 10, center_y + 12, center_x - 2, center_y + 12)
            .stroke({width: 2})
            .fill('none');

        this._group.line(center_x + 2, center_y + 12, center_x + 10, center_y + 12)
            .stroke({width: 2})
            .fill('none');
    }

    private _drawLabel(text="", size=Plate.LabelFontSizePreferred) {
        let label = this._group.text(String(text))
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"});


        label.x(this._container.width())
            .y(this._container.height() - size)
            .stroke({width: 0.5});
    }
}