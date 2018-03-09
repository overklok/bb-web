import Plate from "../core/Plate";
import Cell from "../core/Cell";

class CapacitorPlate extends Plate {
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
     * Нарисовать конденсатор
     *
     * @param {Cell}    position    положение конденсатора
     * @param {string}  orientation ориентация конденсатора
     */
    draw(position, orientation) {
        super.draw(position, orientation);

        this._bezel.fill({color: "#39ffee"}).radius(10);

        this._group.text(`Capacitor`).font({size: 20});
    };

    /**
     * Установить состояние конденсатора
     *
     * @param {object} state новое состояние конденсатора
     */
    setState(state) {
        super.setState(state);
    }
}

export default CapacitorPlate;