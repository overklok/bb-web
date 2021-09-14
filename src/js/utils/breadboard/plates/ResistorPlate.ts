import SVG from "svg.js";
import Cell from "../core/Cell";
import Grid from "../core/Grid";

import Plate, { PlateProps } from "../core/Plate";
import LinearPlate from "../core/plate/LinearPlate";

/**
 * Resistor plate
 * 
 * @category Breadboard
 */
export default class ResistorPlate extends LinearPlate {
    static get Alias() {return "resistor"}

    static get PROP_RESISTANCE() {return "res"}

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
    public get variant() {
        return `${this._shortLabel()} Ω`;
    }

    /**
     * @inheritdoc
     */
    protected get __defaultProps__() {
        return {
            ...super['__defaultProps__'],
            [ResistorPlate.PROP_RESISTANCE]: 200
        };
    }

    /**
     * @inheritdoc
     */
    protected __setProps__(props: PlateProps) {
        let resistance = Number(props[ResistorPlate.PROP_RESISTANCE]);

        if (resistance <= 0) {
            throw RangeError("Resistance cannot be less than 0");
        }

        super.__setProps__(props);

        this._props[ResistorPlate.PROP_RESISTANCE] = resistance;
    }

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();
        this._drawLabel();
    };

    /**
     * Draws a resistor image over the plate surface
     *
     * @param {number} qs size of squares
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
            .move(rect1.cx(), rect2.cy());

        this._group.rect(line_len / 2.5, qs / 2)
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy())
    }

    /**
     * Draws label with the nominal value of the resistor
     * 
     * @param size label font size
     */
    private _drawLabel(size=Plate.LabelFontSizePreferred) {
        this._group.text(this._shortLabel())
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight})
            .cx(this._container.width() / 2)
            .cy(this._container.height() / 4)
            .stroke({width: 0.5})
    }

    /**
     * @returns short designation of the resistor nominal
     */
    private _shortLabel() {
        let label = this._props[ResistorPlate.PROP_RESISTANCE]

        let num = Number(label);

        if (num / 1000 >= 1)    {label = num / 1000      + 'k'}
        if (num / 1000000 >= 1) {label = num / 1000000   + 'M'}

        return String(label);
    }
}