import Plate from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";
import PlateLayer from "../layers/PlateLayer";

const LED_COLOURS = {
    RED: 0,
    GREEN: 1
}

export default class LEDPlate extends LinearPlate {
    static get Alias() {return "LED"}

    static get PROP_COLOUR() {return "clr"}

    static get COLOURS() {return LED_COLOURS}

    constructor(container, grid, schematic=false, verbose=false, id, props) {
        super(container, grid, schematic, verbose, id, props);
    }

    get __defaultProps__() {
        return {
            [LEDPlate.PROP_COLOUR]: LEDPlate.COLOURS.RED
        }
    }

    __setProps__(props) {
        super.__setProps__(props);

        let colour = this._props[LEDPlate.PROP_COLOUR];

        if (colour === 'R') {colour = LEDPlate.COLOURS.RED}
        if (colour === 'G') {colour = LEDPlate.COLOURS.GREEN}

        colour = Number(colour);

        if (colour !== 0 && colour !== 1) {
            colour = 0;
            console.error("Colour of LED must be one of R, G, 0, 1. Fall back to 0");
        }

        this._props[LEDPlate.PROP_COLOUR] = colour;
    }

    /**
     * Нарисовать диод
     *
     * @param {Cell}   position     положение светодиода
     * @param {string}  orientation ориентация светодиода
     */
    __draw__(position, orientation) {
        this._drawPicture();
        this._drawLabel(this._props[LEDPlate.PROP_COLOUR] === LEDPlate.COLOURS.RED ? 'R' : 'G');

        if (this._params.verbose) {
            this._redrawOutput(this._state.output);
        }

        // this._group.text(`Diode ${this._params.colour}`).font({size: 20});
    };

    /**
     * Установить состояние светодиода
     *
     * @param {object} state новое состояние светодиода
     */
    setState(state, suppress_events) {
        state.output = Number(state.input);

        super.setState(state, suppress_events);

        if (this._params.verbose) {
            this._redrawOutput(state.output);
        }
    }

    _redrawOutput(output_value) {
        if (!this._svgout) {
            let cell = this.__grid.cell(0, 0);
            this._svgout = this._group.text('0')
                .center(cell.center_rel.x, cell.center_rel.y)
                .style({fill: '#FFF', size: 18});
        }

        this._svgout.text(output_value ? '1' : '0');
    }

    /**
     * Переместить светодиод
     *
     * @param {int} dx смещение светодиода по оси X
     * @param {int} dy смещение светодиода по оси Y
     */
    shift(dx, dy) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть светодиод
     *
     * @param {string} orientation ориентация светодиода
     */
    rotate(orientation) {
        super.rotate(orientation);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizePreferred) {
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

    _drawLabel(text="", size=Plate.LabelFontSizePreferred) {
        this._group.text(String(text))
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight})
            .cx(this._container.width() - size/2)
            .cy(this._container.height() - size/2)
            .stroke({width: 0.5})
    }
}