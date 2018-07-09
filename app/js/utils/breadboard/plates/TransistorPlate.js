import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class TransistorPlate extends Plate {
    static get Alias() {return "transistor"}

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
            .cx(cell1.center.x - qs / 2)
            .y(cell1.pos.y);

        let rect2 = this._group.rect(qs, qs)
            .cx(cell2.center.x - qs / 2)
            .y(cell2.pos.y);

        let rect3 = this._group.rect(qs, qs)
            .cx(cell3.center.x - qs / 2)
            .y(cell3.pos.y + qs * 2);

        let line_len = rect2.x() - rect1.x() - qs*2;

        let line_gap = line_len / 8;

        let line_top_1 = this._group.path([
            ['M', 0, 0],
            ['l', line_len/2 - line_gap, 0],
            ['l', qs, qs],
        ])
            .stroke({width: 3})
            .fill('none')
            .move(rect1.cx(), rect1.cy());

        let line_top_2 = this._group.path([
            ['M', 0, 0],
            ['l', qs, -qs],
            ['l', line_len/2 - line_gap, 0],
        ])
            .stroke({width: 3})
            .fill('none')
            .move(rect1.cx() + line_gap*5 + qs, rect1.cy());

        let line_center = this._group.path([
            ['M', 0, 0],
            ['l', line_gap*4, 0],
            ['M', line_gap*4/2, 0],
            ['l', 0, qs/2],
        ])
            .stroke({width: 2, color: "#000"})
            .fill('none')
            .x(cell3.center.x - line_gap*2.5)
            .y(cell1.center.y - qs/2);

        this._group.polyline([
                [0, 0],
                [line_gap/1.2, 0],
                [line_gap/2.4, -line_gap/1.5],
                [0, 0],
            ])
            .fill('#000')
            .move(line_top_2.x() + line_gap/4.8, line_top_2.y())
            .rotate(45);

        // this._group.path([
        //     ['M', 0, 0],
        //     ['l', line_gap/2, -line_gap/2.2],
        //     ['l', line_gap/4, line_gap/1.5],
        //     ['l', -line_gap/1.35, -line_gap/4],
        // ])
        //     .stroke({width: 1, color: "#000"})
        //     .fill('#000')
        //     .move(rect1.cx() + line_gap*3.2, rect1.cy() + qs/3.6);
        //
        // let line_connector = this._group.polyline([
        //     [0, 0],
        //     [0, qs/1.5],
        //     [qs/2, qs],
        //     [line_gap, qs]
        // ])
        //     .stroke({width: 3})
        //     .fill('none')
        //     .move(rect3.cx(), rect3.cy())
        //     .scale(-1, 1).x(rect3.cx() + line_gap)
    }
}