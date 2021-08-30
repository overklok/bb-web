import SVG from "svg.js";
import Cell from "../core/Cell";
import Grid from "../core/Grid";

import Plate, { PlateProps } from "../core/Plate";
import LinearPlate from "../core/plate/LinearPlate";

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

    get __defaultProps__() {
        return {
            ...super['__defaultProps__'],
            [ResistorPlate.PROP_RESISTANCE]: 200
        };
    }

    get variant() {
        return `${this._shortLabel()} Ω`;
    }

    __setProps__(props: PlateProps) {
        let resistance = Number(props[ResistorPlate.PROP_RESISTANCE]);

        if (resistance <= 0) {
            throw RangeError("Resistance cannot be less than 0");
        }

        super.__setProps__(props);

        this._props[ResistorPlate.PROP_RESISTANCE] = resistance;
    }

    /**
     * Нарисовать резистор
     *
     * @param {Cell}   position    положение резистора
     * @param {string}  orientation ориентация резистора
     */
    __draw__(position: Cell, orientation: string) {
        this._drawPicture();
        this._drawLabel();
    };

    /**
     * Переместить резистор
     *
     * @param {int} dx смещение резистора по оси X
     * @param {int} dy смещение резистора по оси Y
     * @param prevent_overflow
     */
    shift(dx: number, dy: number, prevent_overflow: boolean = true) {
        super.shift(dx, dy, prevent_overflow);
    }

    /**
     * Повернуть резистор
     *
     * @param {string} orientation ориентация резистора
     * @param suppress_events
     * @param prevent_overflow
     */
    rotate(orientation: string, suppress_events: boolean = false, prevent_overflow: boolean = true) {
        super.rotate(orientation, suppress_events, prevent_overflow);
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

        this._group.rect(line_len / 2.5, qs / 2)
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy())
    }

    _drawLabel(size=Plate.LabelFontSizePreferred) {
        this._group.text(this._shortLabel())
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight})
            .cx(this._container.width() / 2)
            .cy(this._container.height() / 4)
            .stroke({width: 0.5})
    }

    _shortLabel() {
        let label = this._props[ResistorPlate.PROP_RESISTANCE]

        let num = Number(label);

        if (num / 1000 >= 1)    {label = num / 1000      + 'k'}
        if (num / 1000000 >= 1) {label = num / 1000000   + 'M'}

        return String(label);
    }
}