import Layer from "../core/Layer";

import ResistorPlate from "../plates/ResistorPlate";

const PLATE_TYPES = {
    RESISTOR:   'resistor',
    BRIDGE:     'bridge',
    DIODE:      'diode',
};

/**
 * Слой плашек
 */
class PlateLayer extends Layer {
    constructor(container, grid) {
        super(container, grid);

        this._container.id("plate");

        this._plates = {};

        this._cellgroup = undefined;
    }

    compose() {
        this._cellgroup = this._container.group();
        this._cellgroup.move(200, 200);
    }

    /**
     * Возвратить экземпляр плашки по идентификатору
     *
     * @param plate_id
     * @returns {*}
     */
    getPlateById(plate_id) {
        if (!(plate_id in this._plates)) {
            throw new RangeError("Plate does not exist");
        }

        return this._plates[plate_id];
    }

    /**
     * Добавить плашку на слой
     *
     * @param {string}      type        тип плашки
     * @param {int}         x           позиция плашки по оси X
     * @param {int}         y           позиция плашки по оси Y
     * @param {string}      orientation ориентация плашки
     * @param {null|int}    id          идентификатор плашки
     * @param {*}           extra       резервное поле
     *
     * @returns {int} идентификатор плашки
     */
    addPlate(type, x, y, orientation, id, extra) {
        if (!(typeof id !== "undefined") || !(typeof x !== "undefined") || !(typeof y !== "undefined") || !orientation) {
            throw new TypeError("All of `type`, `x`, `y`, `orientation` and `id` arguments must be defined");
        }

        let plate_class = PlateLayer._typeToPlateClass(type);
        let plate = new plate_class(this._cellgroup, this.__grid, id, extra);

        plate.draw(this.__grid.cell(x, y), orientation);

        this._plates[plate.id] = plate;

        return plate.id;
    }

    setPlateState(plate_id, state) {
        if (!plate_id in this._plates) {
            throw new RangeError("This plate does not exist");
        }

        let plate = this._plates[plate_id];

        plate.setState(state);
    }

    /**
     * Удалить все плашки со слоя
     */
    removeAllPlates() {
        for (let plate_id in this._plates) {
            let plate = this._plates[plate_id];

            plate.dispose();
        }

        this._plates = {};
    }

    /**
     * Перевести тип плашки в класс
     *
     * @param {string} type строковый тип плашки
     *
     * @returns {Plate} класс плашки
     * @private
     */
    static _typeToPlateClass(type) {
        if (!type) {
            throw new TypeError("Parameter `type` is not defined");
        }

        switch (type) {
            case PLATE_TYPES.RESISTOR:  {return ResistorPlate}
            default:                    {throw new RangeError(`Unknown plate type '${type}'`)}
        }
    }
}

export default PlateLayer;