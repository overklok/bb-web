import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class BridgePlate extends Plate {
    static get Alias() {return "bridge"}

    constructor(container, grid, id, length=2) {
        super(container, grid, id, length);

        length = Number(length);
        length = Number.isInteger(length) ? length : 2;

        this._params.len = (length < 2) ? 2 : length;
        this._extra = this._params.len;

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: this._params.len, y: 1};

        this._state = {
            highlighted: false,
        }
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Bridge ${this._params.len} cells`).font({size: 20});
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
     * @param {number} ls толщина линии
     * @private
     */
    _drawPicture(qs=20, ls=8) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._size.x-1, this._size.y-1);

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

        this._group.rect(rect2.x() - rect1.x(), ls)
            .x(cell1.center.x - qs / 2)
            .cy(cell1.center.y - qs / 2);
    }
}