import Plate from "../core/Plate";
import Cell from "../core/Cell";

class BridgePlate extends Plate {
    static get Alias() {return "bridge"}

    constructor(container, grid, id, length=2) {
        super(container, grid, id, length);

        if (length < 2) {
            throw new RangeError("BridgePlate's length cannot be less than 2");
        }

        this._params.length = length;

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: length, y: 1};

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
    draw(position, orientation) {
        super.draw(position, orientation);

        this._bezel.fill({color: "#ff9205"}).radius(10);

        this._group.text(`Bridge ${this._params.length} cells`).font({size: 20});
    };

    /**
     * Установить состояние перемычки
     *
     * @param {object} state новое состояние перемычки
     */
    setState(state) {
        super.setState(state);
    }
}

export default BridgePlate;