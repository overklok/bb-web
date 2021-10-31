import SVG from "svg.js";
import Cell from "../core/Cell";
import Grid from "../core/Grid";

import Plate, { PlateProps, PlateState } from "../core/Plate";
import LinearPlate from "../core/plate/LinearPlate";

const LED_COLOURS = {
    RED: 0,
    GREEN: 1,
    BLUE: 2
}

/**
 * LED plate
 * 
 * @category Breadboard
 * @subcategory Plates
 */
export default class LEDPlate extends LinearPlate {
    static get Alias() {return "LED"}

    static get PROP_COLOUR() {return "clr"}

    static get COLOURS() {return LED_COLOURS}

    private _svgout: SVG.Text;

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
            ...super['__defaultProps__'],
            [LEDPlate.PROP_COLOUR]: LEDPlate.COLOURS.RED
        }
    }

    public get variant() {
        return this._shortLabel();
    }

    /**
     * Установить состояние светодиода
     *
     * @param {object} state новое состояние светодиода
     */
    public setState(state: Partial<PlateState>, suppress_events: boolean = false) {
        state.output = Number(state.input);

        super.setState(state, suppress_events);

        if (this._params.verbose) {
            this._redrawOutput(state.output);
        }
    }


    protected __setProps__(props: PlateProps) {
        super.__setProps__(props);

        let colour = this._props[LEDPlate.PROP_COLOUR];

        if (colour === 'R') {colour = LEDPlate.COLOURS.RED}
        if (colour === 'G') {colour = LEDPlate.COLOURS.GREEN}
        if (colour === 'B') {colour = LEDPlate.COLOURS.BLUE}

        colour = Number(colour);

        if (colour !== 0 && colour !== 1 && colour !== 2) {
            colour = 0;
            console.error("Colour of LED must be one of R, G, B, 0, 1, 2. Fall back to 0");
        }

        this._props[LEDPlate.PROP_COLOUR] = colour;
    }

    /**
     * Нарисовать диод
     *
     * @param {Cell}   position     положение светодиода
     * @param {string}  orientation ориентация светодиода
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();
        this._drawLabel();

        if (this._params.verbose) {
            this._redrawOutput(this._state.output);
        }

        // this._group.text(`Diode ${this._params.colour}`).font({size: 20});
    };

    private _redrawOutput(output_value: string) {
        if (!this._svgout) {
            let cell = this.__grid.cell(0, 0);
            this._svgout = this._group.text('0')
                .center(cell.center_rel.x, cell.center_rel.y)
                .style({fill: '#FFF', size: 18});
        }

        this._svgout.text(output_value ? '1' : '0');
    }

    /**
     * Draws LEDs on the plate surface
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

        let trng = this._group.polyline([
            [0, 0],
            [0, qs*3/2],
            [qs, qs*3/4],
            [0, 0],
        ])
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy());

        let ptrpath = [
            [0, 0],
            [qs/2, -qs/2],
            [qs/2-7, -qs/2+4],
            [qs/2-4, -qs/2+7],
            [qs/2, -qs/2],
        ];

        let ptr1 = this._group.polyline(ptrpath).stroke({width: 1}).fill("#000");
        let ptr2 = this._group.polyline(ptrpath).stroke({width: 1}).fill("#000");

        ptr1.move(trng.x() + trng.width() / 2, trng.y() - trng.height() / 4);
        ptr2.move(trng.x() + trng.width() / 2 + 5, trng.y() - trng.height() / 4 + 5);
    }

    /**
     * Draws a label for the LED
     * 
     * @param size label font size
     */
    private _drawLabel(size=Plate.LabelFontSizePreferred) {
        this._group.text(this._shortLabel())
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight})
            .cx(this._container.width() - size/1.5)
            .cy(this._container.height() - size/1.5)
            .stroke({width: 0.5})
    }

    /**
     * @returns short letter designation of the colour property
     */
    private _shortLabel(): string {
        switch (this._props[LEDPlate.PROP_COLOUR]) {
            case LEDPlate.COLOURS.RED:      return 'R'; break;
            case LEDPlate.COLOURS.GREEN:    return 'G'; break;
            case LEDPlate.COLOURS.BLUE:     return 'B'; break;
        }

        return 'UNK';
    }
}