import Layer from "../core/Layer";

import Plate from "../core/Plate";
import PlateContextMenu from "../menus/PlateContextMenu";
import ResistorPlate        from "../plates/ResistorPlate";
import PhotoresistorPlate   from "../plates/PhotoresistorPlate";
import RheostatPlate        from "../plates/RheostatPlate";
import BridgePlate          from "../plates/BridgePlate";
import ButtonPlate          from "../plates/ButtonPlate";
import SwitchPlate          from "../plates/SwitchPlate";
import CapacitorPlate       from "../plates/CapacitorPlate";
import TransistorPlate      from "../plates/TransistorPlate";
import InductorPlate        from "../plates/InductorPlate";
import RelayPlate           from "../plates/RelayPlate";
import StripPlate           from "../plates/StripPlate";
import DiodePlate           from "../plates/LEDPlate";
import ContextMenu from "../core/ContextMenu";

/**
 * Слой плашек
 */
export default class PlateLayer extends Layer {
    static get Class() {return "bb-layer-plate"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(PlateLayer.Class);

        this._callbacks = {
            change: () => {},
            dragstart: () => {},
        };

        this._plates = {};
        this._cellgroup = undefined;

        this._plate_selected = undefined;
        this._editable = false;
    }

    compose() {
        this._cellgroup = this._container.group();
        this._cellgroup.move(100, 170);
    }

    /**
     * Возвратить данные текущих плашек
     *
     * @returns {Array} данные текущих плашек
     */
    getCurrentPlatesData() {
        let data = [];

        for (let plate_id in this._plates) {
            let plate = this._plates[plate_id];

            data.push({
                id: plate.id,
                type: plate.alias,
                x: plate._state.cell.idx.x,
                y: plate._state.cell.idx.y,
                length: plate._params.size.x,
                orientation: plate._state.orientation,
                extra: plate._params.extra,
                currents: plate._state.currents,
                voltages: plate._state.voltages,
                adc: plate._state.adc,
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

    /**
     * Включить режим редактирования плашки
     *
     * @param editable
     * @returns {boolean}
     */
    setEditable(editable=false) {
        if (editable === this._editable) {
            return true;
        }

        if (editable) {
            this._setCurrentPlatesEditable(true);
            this._editable = true;
        } else {
            this._setCurrentPlatesEditable(false);
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
            this._attachEventsEditable(plate);

            /// показать на плашке группу, отвечающую за информацию в состоянии редактируемости
            plate.showGroupEditable(true);
        }

        plate.draw(this.__grid.cell(x, y), orientation);

        this._plates[plate.id] = plate;

        return plate.id;
    }

    /**
     * Подсветить ошибочные плашки
     *
     * @param {Array} plate_ids массив идентификаторов плашек, которые требуется подсветить
     */
    highlightPlates(plate_ids) {
        for (let plate_id in this._plates) {
            this._plates[plate_id].highlight(false);
        }

        for (let plate_id of plate_ids) {
            if (!(plate_id in this._plates)) {
                throw new RangeError("Plate does not exist");
            }

            this._plates[plate_id].highlight(true);
        }
    }

    /**
     * Удалить плашку
     *
     * @param {int} id идентификатор плашки
     */
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

        this._callbacks.change({
            id: plate.id,
            action: 'remove'
        })
    }

    /**
     * Установить состояние плашки
     *
     * @param {int}     plate_id    идентифиактор плашки
     * @param {object}  state       состояние плашки
     */
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
            this.removePlate(plate_id);
        }
    }

    /**
     * Установить обработчик изменения слоя
     *
     * @param {function} cb фукнция, вызывающаяся при изменении содержимого слоя
     */
    onChange(cb) {
        if (!cb) {this._callbacks.change = () => {}}

        this._callbacks.change = cb;
    }

    onDragStart(cb) {
        if (!cb) {this._callbacks.dragstart = () => {}}

        this._callbacks.dragstart = cb;
    }

    /**
     * Сделать текущие плашки редактируемыми
     *
     * @param   {boolean} editable флаг, сделать редактируемыми?
     *
     * @returns {boolean} принято ли значение флага
     *
     * @private
     */
    _setCurrentPlatesEditable(editable=false) {
        if (editable === this._editable) {
            return true;
        }

        if (editable === false) {
            if (this._plate_selected) {
                this._plate_selected.deselect(); // снять выделение
            }
            this._plate_selected = null;     // удалить ссылку на выделенный элемент
            this._container.select(`svg.${Plate.Class}`).off(); // отписать все плашки от событий
            document.removeEventListener('click', this._onClick(), false);
            document.removeEventListener('keydown', this._onKey(), false);
            document.removeEventListener('contextmenu', this._onContextMenu(), false);

            for (let plate_id in this._plates) {
                let plate = this._plates[plate_id];

                /// скрыть на плашке группу, отвечающую за информацию в состоянии редактируемости
                plate.showGroupEditable(false);
            }

            return true;
        }

        for (let plate_id in this._plates) {
            let plate = this._plates[plate_id];

            /// показать на плашке группу, отвечающую за информацию в состоянии редактируемости
            plate.showGroupEditable(true);
            this._attachEventsEditable(plate);
        }

        document.addEventListener('click', this._onClick(), false);
        document.addEventListener('keydown', this._onKey(), false);
        document.addEventListener('contextmenu', this._onContextMenu(), false);

        return true;
    }

    /**
     * Назначить внутренние обработчики событий плашки
     *
     * @param {Plate} plate плашка, события которыой необходимо будет обрабатывать
     *
     * @private
     */
    _attachEventsEditable(plate) {
        if (!plate) {
            throw new TypeError("A `plate` argument must be defined");
        }

        /// Когда на плашку нажали кнопкой мыши
        plate.container.mousedown(evt => {
            if (evt.target.classList.contains(ContextMenu.ItemClass)) return;
            if (evt.target.classList.contains(ContextMenu.ItemInputClass)) return;

            /// Если плашка не была выделена ранее
            if (this._plate_selected && plate !== this._plate_selected) {
                /// Снять её выделение
                this._plate_selected.deselect();
                /// Убрать контекстное меню
                this._plate_selected.hideContextMenu();
                /// Отключить её события
                this._plate_selected.setEditable(false);
                this._plate_selected.onChange(null);
            }

            /// Обрабатывать её события
            plate.setEditable(this._container.node);
            plate.onChange((data) => this._callbacks.change(data));
            plate.onContextMenuItemClick((alias, value) => {this._onPlateContextMenuItemClick(alias, value)});
            plate.onDragFinish(() => this._onPlateDragFinish(plate));
            plate.onDragStart(() => {
                this._onPlateDragStart(plate);
                this._callbacks.dragstart(plate);
            });

            /// выделить данную плашку
            this._plate_selected = plate;
            this._plate_selected.select();

            if (evt.which === 3) {
                plate.showContextMenu(evt, this._container.node);
            } else {
                plate.hideContextMenu();
            }
        });
    }

    /**
     * Сгенерировать обработчик события нажатия кнопкой мыши по слою
     *
     * Если обработчик события был сгенерирован ранее, возвращается точно тот же обработчик.
     * Это можно использовать для открепления обработчика с помощью функции removeEventListener.
     *
     * @returns {function(evt: Object)): undefined} обработчик события нажатия кнопкой мыши по слою
     *
     * @private
     */
    _onClick() {
        if (this._onclick) {
            return this._onclick;
        }

        this._onclick = (evt) => {
            let el = evt.target;

            /// Определить, является ли элемент, по которому выполнено нажатие, частью плашки
            while ((el = el.parentElement) && !(el.classList.contains(Plate.Class))) {}

            /// Если не попали по плашке, но есть выделенная плашка
            if (!el && this._plate_selected) {
                /// Снять выделение
                this._plate_selected.deselect();
                /// Убрать контекстное меню
                this._plate_selected.hideContextMenu();

                /// Отключить её события
                this._plate_selected.setEditable(false);
                this._plate_selected.onChange(null);
                this._plate_selected.onContextMenuItemClick(null);

                this._plate_selected = null;
            }
        };

        return this._onclick;
    }

    /**
     * Сгенерировать обработчик вызова контекстного меню
     *
     * @returns {function(evt: Object)): undefined} обработчик вызова контекстного меню
     *
     * @private
     */
    _onContextMenu() {
        if (this._oncontextmenu) {
            return this._oncontextmenu;
        }

        // ie 9+ only
        this._oncontextmenu = (evt) => {
            let el = evt.target;

            /// Определить, является ли элемент, по которому выполнено нажатие, частью плашки
            while ((el = el.parentElement) && !(el.classList.contains(Plate.Class))) {}

            /// Если элемент является частью плашки
            if (el) {
                evt.preventDefault();
            } else if (this._plate_selected) {
                this._plate_selected.hideContextMenu();
            }
        }

        return this._oncontextmenu;
    }

    /**
     * Сгенерировать обработчик события нажатия клавиши
     *
     * Если обработчик события был сгенерирован ранее, возвращается точно тот же обработчик.
     * Это можно использовать для открепления обработчика с помощью функции removeEventListener.
     *
     * @returns {function(evt: Object)): undefined} обработчик события нажатия клавиши
     *
     * @private
     */
    _onKey() {
        if (this._onkey) {
            return this._onkey;
        }

        /// Когда нажата кнопка клавиатуры
        this._onkey = (evt) => {
            if (this._plate_selected) {
                /// Если есть выделенная плашка
                switch (evt.key) {
                    case "[":
                        evt.preventDefault();
                        this._plate_selected.rotateClockwise();
                        break;
                    case "]":
                        evt.preventDefault();
                        this._plate_selected.rotateCounterClockwise();
                        break;
                    case "ArrowLeft":
                        evt.preventDefault();
                        this._plate_selected.shift(-1, 0);
                        break;
                    case "ArrowRight":
                        evt.preventDefault();
                        this._plate_selected.shift(1, 0);
                        break;
                    case "ArrowUp":
                        evt.preventDefault();
                        this._plate_selected.shift(0, -1);
                        break;
                    case "ArrowDown":
                        evt.preventDefault();
                        this._plate_selected.shift(0, 1);
                        break;
                }

                if (evt.key === "d" || evt.key === "D") {
                    evt.preventDefault();
                    this._duplicatePlate(this._plate_selected);
                }

                if (evt.key === "Delete") {
                    evt.preventDefault();
                    /// Удалить её
                    this.removePlate(this._plate_selected.id);
                    this._plate_selected = null;
                }
            }
        };

        return this._onkey;
    }

    /**
     * Обработать нажатие на пункт контекстного меню текущей плашки
     *
     * @param {string} action_alias кодовое название пункта меню
     *
     * @private
     */
    _onPlateContextMenuItemClick(action_alias, value) {
        switch (action_alias) {
            case PlateContextMenu.CMI_REMOVE: {
                this.removePlate(this._plate_selected.id);
                break;
            }
            case PlateContextMenu.CMI_ROTCW: {
                this._plates[this._plate_selected.id].rotateClockwise();
                break;
            }
            case PlateContextMenu.CMI_ROTCCW: {
                this._plates[this._plate_selected.id].rotateCounterClockwise();
                break;
            }
            case PlateContextMenu.CMI_DUPLIC: {
                this._duplicatePlate(this._plate_selected);
                break;
            }
            case PlateContextMenu.CMI_SETADC: {
                this._plate_selected.setState({adc: Number(value)});
                break;
            }
        }
    }

    _duplicatePlate(plate) {
        let new_plate_id = this.addPlate(
            plate.alias,
            plate.pos.x,
            plate.pos.y,
            plate.state.orientation,
            null,
            plate.extra,
        );

        this._plates[new_plate_id].setState(plate.state);

        this._plates[new_plate_id].click();
    }

    /**
     * Обработать начало перетаскивания плашки
     *
     * Все остальные плашки "замораживаются"
     *
     * @param {Plate} plate перетаскиваемая плашка
     *
     * @private
     */
    _onPlateDragStart(plate) {
        let id = String(plate.id);

        for (let pl_id in this._plates) {
            if (pl_id !== id) {
                this._plates[pl_id].freeze();
            }
        }
    }

    /**
     * Обработать конец перетаскивания плашки
     *
     * Все остальные плашки "размораживаются"
     *
     * @param {Plate} plate перетаскиваемая плашка
     *
     * @private
     */
    _onPlateDragFinish(plate) {
        let id = String(plate.id);

        for (let pl_id in this._plates) {
            if (pl_id !== id) {
                this._plates[pl_id].unfreeze();
            }
        }
    }

    /**
     * Возвратить массив всех типов плашек
     *
     * @returns {Array<string>}
     *
     * @private
     */
    static _getAllPlateTypes() {
        return [
            ResistorPlate.Alias,
            PhotoresistorPlate.Alias,
            RheostatPlate.Alias,
            BridgePlate.Alias,
            ButtonPlate.Alias,
            SwitchPlate.Alias,
            CapacitorPlate.Alias,
            TransistorPlate.Alias,
            InductorPlate.Alias,
            RelayPlate.Alias,
            DiodePlate.Alias,
            StripPlate.Alias,
        ]
    }

    /**
     * Возвратить словарь всех названий типов плашек по типам плашек
     *
     * @returns {Array<string>} словарь названий типов плашек
     *
     * @private
     */
    static _getAllPlateCaptions() {
        let captions = {};

        captions[ResistorPlate.Alias]       = 'резистор';
        captions[PhotoresistorPlate.Alias]  = 'фоторезистор';
        captions[RheostatPlate.Alias]       = 'реостат';
        captions[BridgePlate.Alias]         = 'перемычка';
        captions[ButtonPlate.Alias]         = 'кнопка';
        captions[SwitchPlate.Alias]         = 'ключ';
        captions[CapacitorPlate.Alias]      = 'конденсатор';
        captions[TransistorPlate.Alias]     = 'транзистор';
        captions[InductorPlate.Alias]       = 'индуктор';
        captions[RelayPlate.Alias]          = 'реле';
        captions[DiodePlate.Alias]          = 'диод';
        captions[StripPlate.Alias]          = 'лента';

        return captions;
    }

    /**
     * Перевести тип плашки в класс
     *
     * @param {string} type строковый тип плашки
     *
     * @returns {Plate} класс плашки
     *
     * @private
     */
    static _typeToPlateClass(type) {
        if (!type) {
            throw new TypeError("Parameter `type` is not defined");
        }

        switch (type) {
            case ResistorPlate.Alias:       {return ResistorPlate}
            case PhotoresistorPlate.Alias:  {return PhotoresistorPlate}
            case RheostatPlate.Alias:       {return RheostatPlate}
            case BridgePlate.Alias:         {return BridgePlate}
            case ButtonPlate.Alias:         {return ButtonPlate}
            case SwitchPlate.Alias:         {return SwitchPlate}
            case CapacitorPlate.Alias:      {return CapacitorPlate}
            case TransistorPlate.Alias:     {return TransistorPlate}
            case InductorPlate.Alias:       {return InductorPlate}
            case RelayPlate.Alias:          {return RelayPlate}
            case DiodePlate.Alias:          {return DiodePlate}
            case StripPlate.Alias:          {return StripPlate}
            default:                        {throw new RangeError(`Unknown plate type '${type}'`)}
        }
    }
}