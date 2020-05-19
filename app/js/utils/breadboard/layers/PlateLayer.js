import Layer from "../core/Layer";
import Plate from "../core/Plate";

import ContextMenu from "../core/ContextMenu";
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
import WS2801Plate          from "../plates/WS2801Plate";
import MotorPlate from "../plates/MotorPlate";

/**
 * Слой плашек
 */
export default class PlateLayer extends Layer {
    static get Class() {return "bb-layer-plate"}

    constructor(container, grid, schematic=false, verbose=false) {
        super(container, grid, schematic, verbose);

        this._container.addClass(PlateLayer.Class);

        this._callbacks = {
            change: () => {},
            dragstart: () => {},
        };

        this._plates = {};
        this._plategroup = undefined;

        this._plate_selected = undefined;
        this._editable = false;
    }

    compose() {
        this._initGroups();
    }

    recompose(schematic, verbose) {
        super.recompose(schematic, false, verbose);

        let plates_data = this.getCurrentPlatesData();

        this.removeAllPlates();

        this._initGroups();

        for (let plate_data of plates_data) {
            this.addPlate(
                plate_data.type,
                plate_data.x,
                plate_data.y,
                plate_data.orientation,
                plate_data.id,
                plate_data.extra,
                false
            );
        }
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
                id:             plate.id,
                type:           plate.alias,
                x:              plate.pos.x,
                y:              plate.pos.y,
                extra:          plate.extra,
                length:         plate.length,
                orientation:    plate.state.orientation,
                input:          plate.state.input,
                // cell_num:       plate._state.cell_num,
                // contr_num:      plate._state.contr_num,
                // currents:       plate._state.currents,
                // voltages:       plate._state.voltages,
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
     * @param {boolean}     animate     анимировать появление плашки
     *
     * @returns {null|int} идентификатор плашки
     */
    addPlate(type, x, y, orientation, id=null, extra=null, animate=false) {
        if (!(typeof x !== "undefined") || !(typeof y !== "undefined") || !orientation) {
            throw new TypeError("All of 'type', 'x', 'y', and 'orientation' arguments must be defined");
        }

        let plate_class, plate;

        if (id in this._plates) {
            this._plates[id].rotate(orientation);
            return id;
        } else {
            plate_class = PlateLayer._typeToPlateClass(type);
            plate = new plate_class(this._plategroup, this.__grid, this.__schematic, this.__verbose, id, extra);
        }

        if (this._editable) {
            this._attachEventsEditable(plate);

            /// показать на плашке группу, отвечающую за информацию в состоянии редактируемости
            plate.showGroupEditable(true);
        }

        try {
            plate.draw(this.__grid.cell(x, y), orientation, animate);
        } catch (err) {
            console.error("Cannot draw the plate", err);
            plate.dispose();

            return null;
        }

        this._plates[plate.id] = plate;

        return plate.id;
    }

    /**
     * Установить плашки на плату
     *
     * Создание новых, сохранение текущих и удаление несуществующих плашек
     * производится автоматически
     *
     * @param {Array<Object>} plates список плашек, которые должны отображаться на слое
     */
    setPlates(plates) {
        /// есть ли изменения
        let is_dirty = false;

        /// снять возможную метку с локальных плашек
        for (let plate_id in this._plates) {
            this._plates[plate_id].___touched = undefined;
            this._plates[plate_id].highlightError(false);
        }

        /// выполнить основной цикл
        // console.log(typeof(plates));
        for (let plate of plates) {
            // console.log(plate);
            /// если плашки нет, пропустить итерацию
            if (!plate) continue;

            // проверить, есть ли изменения
            if (!(plate.id in this._plates)) {is_dirty = true;}

            /// ИД новой/текущей плашки
            let id;

            /// экстра-параметр может называться по-другому
            plate.extra = plate.extra || plate.number;

            /// добавить плашку, если таковой нет
            id = this.addPlate(plate.type, plate.x, plate.y, plate.orientation, plate.id, plate.extra);

            /// если плашка создана без ошибок / существует
            if (id) {
                /// пометить её
                this._plates[id].___touched = true;

                /// обновить состояние
                this.setPlateState(id, {
                    // cell_num: plate.cell_num,
                    // contr_num: plate.contr_num,
                    input: plate.input,
                    output: plate.output,
                });
            }
        }

        /// удалить непомеченные плашки
        for (let plate_id in this._plates) {
            if (!this._plates[plate_id].___touched) {
                this.removePlate(plate_id);

                is_dirty = true;
            }
        }

        if (is_dirty) {
            this._callbacks.change(this._plates);
        }

        return is_dirty;
    }

    /**
     * Подсветить ошибочные плашки
     *
     * @param {Array} plate_ids массив идентификаторов плашек, которые требуется подсветить
     */
    highlightPlates(plate_ids) {
        for (let plate_id in this._plates) {
            this._plates[plate_id].highlightError(false);
        }

        for (let plate_id of plate_ids) {
            if (!(plate_id in this._plates)) {
                throw new RangeError("Plate does not exist");
            }

            this._plates[plate_id].highlightError(true);
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
        if (!(plate_id in this._plates)) {
            console.debug('This plate does not exist', plate_id);
            return false;
            // throw new RangeError(`Plate does not exist (id = '${plate_id}')`);
        }

        let plate = this._plates[plate_id];

        plate.setState(state, true);
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
        if (!cb) {cb = () => {}}

        this._callbacks.change = cb;
    }

    /**
     * Установить обработчик начала перетаскивания плашки
     *
     * @param {function} cb фукнция, вызывающаяся при начале перетаскивания плашки
     */
    onDragStart(cb) {
        if (!cb) {this._callbacks.dragstart = () => {}}

        this._callbacks.dragstart = cb;
    }

    _initGroups() {
        this._clearGroups();

        this._plategroup = this._container.group();
    }

    _clearGroups() {
        if (this._plategroup) this._plategroup.remove();
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
                plate.setEditable();
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
            plate.onChange(data => this._callbacks.change(data));
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
        };

        return this._oncontextmenu;
    }

    /**
     * Сгенерировать обработчик события нажатия клавиши
     *
     * Если обработчик события был сгенерирован ранее, возвращается точно тот же обработчик.
     * Это можно использовать для открепления обработчика с помощью функции removeEventListener.
     *
     * @returns {function} обработчик события нажатия клавиши
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
                switch (evt.code) {
                    case "BracketLeft":
                        this._plate_selected.rotateClockwise();
                        evt.preventDefault();
                        break;
                    case "BracketRight":
                        this._plate_selected.rotateCounterClockwise();
                        evt.preventDefault();
                        break;
                    case "ArrowLeft":
                        this._plate_selected.shift(-1, 0);
                        evt.preventDefault();
                        break;
                    case "ArrowRight":
                        this._plate_selected.shift(1, 0);
                        evt.preventDefault();
                        break;
                    case "ArrowUp":
                        this._plate_selected.shift(0, -1);
                        evt.preventDefault();
                        break;
                    case "ArrowDown":
                        this._plate_selected.shift(0, 1);
                        evt.preventDefault();
                        break;
                    case "KeyD":
                        this._duplicatePlate(this._plate_selected);
                        evt.preventDefault();
                        break;
                    case "Delete":
                        /// Удалить её
                        this.removePlate(this._plate_selected.id);
                        this._plate_selected = null;
                        evt.preventDefault();
                        break;
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
            case PlateContextMenu.CMI_INPUT: {
                this._plate_selected.setState({input: value});
                break;
            }
        }
    }

    /**
     * Продублировать плашку
     *
     * @param {Plate} plate исходная плашка
     * @private
     */
    _duplicatePlate(plate) {
        let new_plate_id = this.addPlate(
            plate.alias,
            plate.pos.x,
            plate.pos.y,
            plate.state.orientation,
            null,
            plate.extra,
            true
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
            WS2801Plate.Alias,
            MotorPlate.Alias,
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
        captions[DiodePlate.Alias]          = 'светодиод';
        captions[StripPlate.Alias]          = 'лента';
        captions[WS2801Plate.Alias]         = 'RGB-светодиод';
        captions[MotorPlate.Alias]          = 'электромотор';

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
            case WS2801Plate.Alias:         {return WS2801Plate}
            case MotorPlate.Alias:          {return MotorPlate}
            default:                        {throw new RangeError(`Unknown plate type '${type}'`)}
        }
    }
}
