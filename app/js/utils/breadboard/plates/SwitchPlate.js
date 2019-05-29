import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class SwitchPlate extends Plate {
    static get Alias() {return "switch"}

    constructor(container, grid, schematic=false, id) {
        super(container, grid, schematic, id);

        this._params.size = {x: 3, y: 2};

        this._params.surface = [
                            {x: 1, y:-1},
            {x: 0, y: 0},   {x: 1, y: 0},   {x: 2, y: 0},
        ];
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
    _drawPicture(qs=Plate.QuadSizeDefault) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let cell3 = this.__grid.cell(1, 0);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);
        let rect3 = this._group.rect(qs, qs);

        rect1.cx(cell1.center_rel.x).cy(cell1.center_rel.y + qs);
        rect2.cx(cell2.center_rel.x).cy(cell2.center_rel.y + qs);
        rect3.cx(cell3.center_rel.x).cy(cell3.center_rel.y - qs);

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