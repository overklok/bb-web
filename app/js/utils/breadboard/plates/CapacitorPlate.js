import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class CapacitorPlate extends Plate {
    static get Alias() {return "capacitor"}

    constructor(container, grid, id, capacity) {
        super(container, grid, id, capacity);

        this._params.size = {x: 2, y: 1};
        this._params.extra = Number(capacity) || 0.001;
    }

    /**
     * Нарисовать конденсатор
     *
     * @param {Cell}    position    положение конденсатора
     * @param {string}  orientation ориентация конденсатора
     */
    __draw__(position, orientation) {
        this._drawPicture();

        this._drawLabel(this._params.extra);
    };

    /**
     * Установить состояние конденсатора
     *
     * @param {object} state новое состояние конденсатора
     */
    setState(state) {
        super.setState(state);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=20) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let rect1 = this._group.rect(qs, qs)
            .center(
                cell1.center.x - qs / 2,
                cell1.center.y - qs / 2
            );

        let rect2 = this._group.rect(qs, qs)
            .center(
                cell2.center.x - qs / 2,
                cell2.center.y - qs / 2
            );

        let line_len = rect2.x() - rect1.x();

        this._group.path([
            ['M', 0, 0],
            ['l', line_len/2 - qs/4, 0],
            ['m', qs/2, 0],
            ['l', line_len/2 - qs*2/4, 0],
        ])
            .stroke({width: 1})
            .fill('none')
            .move(rect1.cx(), rect2.cy());

        let line1 = this._group.line(0, 0, 0, qs*2).stroke({width: 1}).x(rect1.x() + line_len/2 + qs/4).cy(rect1.cy());
        let line2 = this._group.line(0, 0, 0, qs*2).stroke({width: 1}).x(rect2.x() - line_len/2 + qs*3/4).cy(rect2.cy());

        this._group.text("+").move(line2.x() + 4, line2.y() - 8);
    }

    _drawLabel(text="", size=16) {
        let num = Number(text);

        if (num * 1e6 >= 1)    {text = String(Number(num * 1e6).toPrecision())   + 'мк'}
        // if (num * 1e3 >= 1)    {text = String(Number(num * 1e3).toPrecision())   + 'н'}
        if (num >= 1)          {text = String(Number(num).toPrecision())   + 'пк'}

        this._group.text(text + 'Ф')
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "normal"})
            .cx(this._container.width() / 2)
            .y(this._container.height() - size - 2)
            // .stroke({width: 0.5})
    }
}