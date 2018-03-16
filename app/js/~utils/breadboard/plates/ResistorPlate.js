import Plate from "../core/Plate";
import Cell from "../core/Cell";

class ResistorPlate extends Plate {
    static get Alias() {return "resistor"}

    constructor(container, grid, id, resistance) {
        super(container, grid, id, resistance);

        this._params.resistance = (resistance <= 0) ? 200 : resistance;
        this._extra = this._params.resistance;

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: 2, y: 1};

        this._state = {
            highlighted: false,
        }
    }

    /**
     * Нарисовать резистор
     *
     * @param {Cell}   position    положение резистора
     * @param {string}  orientation ориентация резистора
     */
    draw(position, orientation) {
        super.draw(position, orientation);

        this._bezel.fill({color: "#ffffff"}).radius(10);

        this._group.text(`Resistor ${this._params.resistance} Ohm`).font({size: 20});
    };

    /**
     * Установить состояние резистора
     *
     * @param {object} state новое состояние резистора
     */
    setState(state) {
        super.setState(state);
    }

    /**
     * Переместить резистор
     *
     * @param {Cell} position положение резистора
     */
    move(position) {
        super.move(position);
    }

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
}

export default ResistorPlate;