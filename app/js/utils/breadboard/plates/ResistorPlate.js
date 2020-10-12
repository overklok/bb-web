import Plate from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";

export default class ResistorPlate extends LinearPlate {
    static get Alias() {return "resistor"}

    static get PROP_RESISTANCE() {return "res"}

    constructor(container, grid, schematic=false, verbose=false, id, props) {
        super(container, grid, schematic, verbose, id, props);
    }

    get __defaultProps__() {
        return {
            [ResistorPlate.PROP_RESISTANCE]: 200
        };
    }

    __setProps__(props) {
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
    __draw__(position, orientation) {
        this._drawPicture();
        this._drawLabel(this._props[ResistorPlate.PROP_RESISTANCE]);
    };

    /**
     * Переместить резистор
     *
     * @param {int} dx смещение резистора по оси X
     * @param {int} dy смещение резистора по оси Y
     * @param prevent_overflow
     */
    shift(dx, dy, prevent_overflow) {
        super.shift(dx, dy, prevent_overflow);
    }

    /**
     * Повернуть резистор
     *
     * @param {string} orientation ориентация резистора
     * @param suppress_events
     * @param prevent_overflow
     */
    rotate(orientation, suppress_events, prevent_overflow) {
        super.rotate(orientation, suppress_events, prevent_overflow);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizeDefault) {
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

        this._group.rect(line_len / 2.5, qs / 1.5)
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy())
    }

    _drawLabel(text="", size=Plate.LabelSizeDefault) {
        let num = Number(text);

        if (num / 1000 >= 1)    {text = num / 1000      + 'k'}
        if (num / 1000000 >= 1) {text = num / 1000000   + 'M'}

        this._group.text(String(text))
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder"})
            .cx(this._container.width() / 2)
            .cy(this._container.height() / 4)
            .stroke({width: 0.5})
    }
}