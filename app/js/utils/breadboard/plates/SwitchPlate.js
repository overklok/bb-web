import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class SwitchPlate extends Plate {
    static get Alias() {return "switch"}

    constructor(container, grid, id) {
        super(container, grid, id);

        this._params.size = {x: 3, y: 1};
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Button`).font({size: 20});
    };

    /**
     * Установить состояние перемычки
     *
     * @param {object} state новое состояние перемычки
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

        let cell3 = this.__grid.cell(1, 0);

        let rect1 = this._group.rect(qs, qs)
            .cx(cell1.center_rel.x - qs / 2)
            .y(cell1.rel.y + qs * 2);

        let rect2 = this._group.rect(qs, qs)
            .cx(cell2.center_rel.x - qs / 2)
            .y(cell2.rel.y + qs * 2);

        let rect3 = this._group.rect(qs, qs)
            .cx(cell3.center_rel.x - qs / 2)
            .y(cell3.rel.y);

        let line_len = rect2.x() - rect1.x() - qs*2;

        let line_gap = line_len / 6;

        this._group.path([
            ['M', 0, 0],
            ['l', qs, -qs],
            ['l', line_len/2 - line_gap, 0],
            ['m', line_gap*2, 0],
            ['l', line_len/2 - line_gap, 0],
            ['l', qs, qs],
        ])
            .stroke({width: 3})
            .fill('none')
            .move(rect1.cx(), rect1.cy() - qs);

        let line_connector = this._group.polyline([
            [0, 0],
            [0, qs/1.5],
            [qs/2, qs],
            [line_gap, qs]
        ])
            .stroke({width: 3})
            .fill('none')
            .move(rect3.cx(), rect3.cy())
            // .scale(-1, 1).x(rect3.cx() + line_gap)
    }
}