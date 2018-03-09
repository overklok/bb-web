import Layer from "../core/Layer";

import Plate from "../core/Plate";
import ResistorPlate    from "../plates/ResistorPlate";
import BridgePlate      from "../plates/BridgePlate";
import CapacitorPlate   from "../plates/CapacitorPlate";
import StripPlate       from "../plates/StripPlate";

/**
 * Слой плашек
 */
class PlateLayer extends Layer {
    static get Class() {return "bb-layer-plate"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(PlateLayer.Class);

        this._plates = {};
        this._cellgroup = undefined;

        this._plate_selected = undefined;
        this._editable = false;
    }

    compose() {
        this._cellgroup = this._container.group();
        this._cellgroup.move(100, 200);
    }

    getCurrentPlatesData() {
        let data = [];

        for (let plate_id in this._plates) {
            let plate = this._plates[plate_id];

            data.push({
                type: plate.alias,
                x: plate.x,
                y: plate.y,
                orientation: plate.orientation,
                id: plate.id,
                extra: plate.extra
            });
        }

        return data;
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

    setEditable(editable=false) {
        if (editable === this._editable) {
            return true;
        }

        if (editable) {
            this._setCurrentPlatesEditable(true);
            this._setCurrentPlatesRemovable(true);
            this._editable = true;
        } else {
            this._setCurrentPlatesEditable(false);
            this._setCurrentPlatesRemovable(false);
            this._editable = false;
        }
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
            throw new TypeError("All of 'type', 'x', 'y', 'orientation' and 'id' arguments must be defined");
        }

        let plate_class = PlateLayer._typeToPlateClass(type);
        let plate = new plate_class(this._cellgroup, this.__grid, id, extra);

        if (this._editable) {
            plate.setEditable(this._container.node);
            this._attachEventsRemovable(plate);
        }

        plate.draw(this.__grid.cell(x, y), orientation);

        this._plates[plate.id] = plate;

        return plate.id;
    }

    removePlate(id) {
        if (typeof id === "undefined") {
            throw new TypeError("Argument 'id' must be defined");
        }

        if (!(id in this._plates)) {
            throw new TypeError(`Plate ${id} does not exist`);
        }

        let plate = this._plates[id];

        plate.dispose();

        delete this._plates[plate.id];
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

    _setCurrentPlatesEditable(editable=false) {
        for (let plate_id in this._plates) {
            let plate = this._plates[plate_id];

            plate.setEditable(editable && this._container.node);
        }
    }

    _setCurrentPlatesRemovable(editable=false) {
        if (editable === this._editable) {
            return true;
        }

        if (editable === false) {
            this._plate_selected.deselect(); // снять выделение
            this._plate_selected = null;     // удалить ссылку на выделенный элемент
            this._container.select(`svg.${Plate.Class}`).off(); // отписать все плашки от событий
            document.removeEventListener('click', this._onClick(), false);
            return true;
        }

        for (let plate_id in this._plates) {
            let plate = this._plates[plate_id];

            this._attachEventsRemovable(plate);
        }

        document.addEventListener('click', this._onClick(), false);

        return true;
    }

    _attachEventsRemovable(plate) {
        if (!plate) {
            throw new TypeError("A `plate` argument must be defined");
        }

        plate.container.mousedown(evt => {
            if (this._plate_selected) {
                this._plate_selected.deselect();
            }

            this._plate_selected = plate;
            this._plate_selected.select();
        });

        plate.container.dblclick(evt => {
            if (plate === this._plate_selected) {
                this._plate_selected = null;
            }

            this.removePlate(plate.id);
        });
    }

    _onClick() {
        if (this._onclick) {
            return this._onclick;
        }

        this._onclick = (evt) => {
            let el = evt.target;

            while ((el = el.parentElement) && !(el.classList.contains(Plate.Class))) {}

            if (!el && this._plate_selected) {
                this._plate_selected.deselect();
                this._plate_selected = null;
            }
        };

        return this._onclick;
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
            case ResistorPlate.Alias:  {return ResistorPlate}
            case BridgePlate.Alias:    {return BridgePlate}
            case CapacitorPlate.Alias: {return CapacitorPlate}
            case StripPlate.Alias:     {return StripPlate}
            default:                   {throw new RangeError(`Unknown plate type '${type}'`)}
        }
    }
}

export default PlateLayer;