import Plate from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";

export default class ResistorPlate extends LinearPlate {
    static get Alias() {return "resistor"}

    constructor(container, grid, schematic=false, verbose=false, id, resistance) {
        super(container, grid, schematic, verbose, id, resistance);

        this._params.extra = (resistance <= 0) ? 200 : resistance;
    }

    /**
     * Нарисовать резистор
     *
     * @param {Cell}   position    положение резистора
     * @param {string}  orientation ориентация резистора
     */
    __draw__(position, orientation) {
        this._drawPicture();
        this._drawLabel(this._params.extra);

        // this._group.text(`Resistor ${this._params.extra} Ohm`).font({size: 20});
    };

    /**
     * Переместить резистор
     *
     * @param {int} dx смещение резистора по оси X
     * @param {int} dy смещение резистора по оси Y
     */
    shift(dx, dy) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть резистор
     *
     * @param {string} orientation ориентация резистора
     */
    rotate(orientation) {
        super.rotate(orientation);
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