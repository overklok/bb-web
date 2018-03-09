import Plate from "../core/Plate";
import Cell from "../core/Cell";

class ButtonPlate extends Plate {
    static get Alias() {return "capacitor"}

    constructor(container, grid, id) {
        super(container, grid, id);

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: 2, y: 1};

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

        this._bezel.fill({color: "#39ffee"}).radius(10);

        this._group.text(`Capacitor`).font({size: 20});
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

export default ButtonPlate;