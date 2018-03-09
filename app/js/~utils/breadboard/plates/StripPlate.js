import Plate from "../core/Plate";
import Cell from "../core/Cell";

class StripPlate extends Plate {
    static get Alias() {return "strip"}

    constructor(container, grid, id, length=1) {
        super(container, grid, id, length);

        if (length < 1) {
            throw new RangeError("StripPlate's length cannot be less than 1");
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

        this._bezel.fill({color: "#e39eff"});
        this._bezel.width(this._container.width() + this._cell.size.x / 4);
        this._bezel.dx(-this._cell.size.x / 4);

        this._group.text(`Strip ${this._params.length} cells`).font({size: 26});
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

export default StripPlate;