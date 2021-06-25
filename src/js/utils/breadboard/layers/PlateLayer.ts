import Layer from "../core/Layer";

import Plate, {PlateRef} from "../core/Plate";
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
import DiodePlate           from "../plates/LEDPlate";
import MotorPlate           from "../plates/MotorPlate";
import RGBPlate             from "../plates/RGBPlate";
import DummyPlate           from "../plates/DummyPlate";
import BuzzerPlate          from "../plates/BuzzerPlate";
import isEqual from "lodash/isEqual";
import UnkPlate from "../plates/UnkPlate";
import {getCursorPoint} from "../core/extras/helpers";

/**
 * Слой плашек
 */
export default class PlateLayer extends Layer {
    static get Class() {return "bb-layer-plate"}

    // TODO: Move this information to Plate classes
    static get TypesReversible() {
        return [
            BridgePlate.Alias,
            ResistorPlate.Alias,
            PhotoresistorPlate.Alias,
            CapacitorPlate.Alias,
            ButtonPlate.Alias,
            InductorPlate.Alias,
            BuzzerPlate.Alias,
            DummyPlate.Alias,
            UnkPlate.Alias,
        ];
    }

    static comparePlates(svg, grid, plate1_data, plate2_data) {
        if (plate1_data.type !== plate2_data.type) return false;
        if (!isEqual(plate1_data.properties, plate2_data.properties)) return false;

        let is_orientation_equal = plate1_data.orientation === plate2_data.orientation;

        if (PlateLayer.TypesReversible.indexOf(plate1_data.type) === -1) {
            if (!is_orientation_equal) return false;
            if (plate1_data.x !== plate2_data.x || plate1_data.y !== plate2_data.y) return false;
        } else {
            const plate1 = PlateLayer.jsonToPlate(svg, grid, plate1_data),
                  plate2 = PlateLayer.jsonToPlate(svg, grid, plate2_data);

            const {x: p1_x0, y: p1_y0} = plate1.pos,
                  {x: p2_x0, y: p2_y0} = plate2.pos,
                  p1_surf_points = plate1.surface,
                  p2_surf_points = plate2.surface;

            for (const p1_surf_point of p1_surf_points) {
                const {x: p1_x, y: p1_y} = Plate._orientXYObject(p1_surf_point, plate1.state.orientation);

                let has_same_point = false;

                for (const p2_surf_point of p2_surf_points) {
                    const {x: p2_x, y: p2_y} = Plate._orientXYObject(p2_surf_point, plate2.state.orientation);

                    if ((p1_x0 + p1_x === p2_x0 + p2_x) && (p1_y0 + p1_y === p2_y0 + p2_y)) {
                        has_same_point = true;
                        break;
                    }
                }

                if (has_same_point === false) return false;
            }
        }

        return true;
    }

    static jsonToPlate(svg, grid, plate_data) {
        const {type, position: {cell: {x, y}, orientation}, properties} = plate_data;

        const plate_class = PlateLayer.typeToPlateClass(type);
        const plate = new plate_class(svg, grid, false, false, false, properties);
        plate.draw(grid.cell(x, y), orientation, false);

        return plate;
    }

    constructor(container, grid, schematic=false, verbose=false) {
        super(container, grid, schematic, false, verbose);

        this._container.addClass(PlateLayer.Class);

        this._callbacks = {
            change: () => {},
            dragstart: () => {},
        };

        this._plates = {};
        this._plategroup = undefined;

        this._cell_supposed = undefined;
        this._plate_dragging = undefined;
        this._plate_selected = undefined;
        this._editable = false;

        /// Последняя позиция перемещения курсора
        this._cursor_point_mousedown = undefined;

        this._handleKey = this._handleKey.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleContextMenu = this._handleContextMenu.bind(this);
    }

    compose() {
        this._initGroups();
    }

    recompose(schematic, verbose) {
        super.recompose(schematic, false, verbose);

        let plates_data = this.getSerializedPlates();

        this.removeAllPlates();

        this._initGroups();

        for (let plate_data of plates_data) {
            this.addPlate(
                plate_data.type,
                plate_data.position.cell.x,
                plate_data.position.cell.y,
                plate_data.position.orientation,
                plate_data.id,
                plate_data.properties,
                false
            );
        }
    }

    setPlateStyle(style) {
        if (style && style.quad_size != null) {
            Plate.QuadSizePreferred = style.quad_size;
        } else {
            Plate.QuadSizePreferred = Plate.QuadSizeDefault;
        }

        if (style && style.led_size != null) {
            Plate.LEDSizePreferred = style.led_size;
        } else {
            Plate.LEDSizePreferred = Plate.LEDSizeDefault;
        }

        if (style && style.label_font_size != null) {
            Plate.LabelFontSizePreferred = style.label_font_size;
        } else {
            Plate.LabelFontSizePreferred = Plate.LabelFontSizeDefault;
        }
    }

    /**
     * Возвратить данные текущих плашек
     *
     * @returns {Array} данные текущих плашек
     */
    getSerializedPlates() {
        let data = [];

        for (let plate_id of Object.keys(this._plates)) {
            let plate = this._plates[plate_id];

            data.push(plate.serialize());
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

    setRandom(_protos, size_mid=10, size_deviation=2, attempts_max=40) {
        const protos = [];

        const orientations = [
            Plate.Orientations.East,
            Plate.Orientations.West,
            Plate.Orientations.North,
            Plate.Orientations.South
        ];

        for (const proto of _protos) {
            if (proto.quantity > 0) {
                protos.push({type: proto.type, properties: proto.properties, qty: proto.quantity})
            }
        }

        let remaining = size_mid + this.getRandomInt(-size_deviation, size_deviation);

        while (remaining > 0) {
            if (protos.length === 0) return;

            const p_index = this.getRandomInt(0, protos.length - 1)
            const proto = {type: protos[p_index].type, properties: protos[p_index].properties, qty: protos[p_index].qty};

            if (proto.qty === 1) {
                protos.splice(p_index, 1);
            }

            proto.qty--;

            let placed = false,
                attempts = 0;

            while (!placed && attempts < attempts_max) {
                let orientation = orientations[this.getRandomInt(0, orientations.length - 1)],
                    x = this.getRandomInt(0, this.__grid.dim.x-1),
                    y = this.getRandomInt(0, this.__grid.dim.y-1);

                placed = this.addPlate(
                    proto.type, x, y, orientation, null, proto.properties, false, true
                );

                if (placed) {
                    if (this.hasIntersections(placed)) {
                        this.removePlate(placed);
                        placed = false;
                    }
                }

                attempts++;
            }

            remaining--;
        }
    }

    getRandomInt(min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }

    hasIntersections(plate_id) {
        const plate = this._plates[plate_id],
              {x: px0, y: py0} = plate.pos,
              plate_rels = plate.surface;

        for (const p of Object.values(this._plates)) {
            const {x: x0, y: y0} = p.pos,
                  p_rels = p.surface;

            if (p.id === plate.id) continue;

            if ((x0 === px0) && (y0 === py0)) return true;

            for (const p_rel of p_rels) {
                const {x, y} = Plate._orientXYObject(p_rel, p.state.orientation);

                if (plate_rels) {
                    for (const plate_rel of plate_rels) {
                        const {x: px, y: py} = Plate._orientXYObject(plate_rel, plate.state.orientation);

                        if ((px0 + px === x0 + x) && (py0 + py === y0 + y)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
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

    takePlate(plate_data, plate_x, plate_y, cursor_x, cursor_y) {
        const id = this.addPlateSerialized(
            plate_data.type, plate_data.position, null, plate_data.properties, false
        );

        const plate = this._plates[id];
        let plate_point = getCursorPoint(this._container.node, plate_x, plate_y);

        plate.center_to_point(plate_point.x, plate_point.y);
        this._handlePlateMouseDown({which: 1}, plate);
        this.selectPlate(plate);
    }

    /**
     * Добавить плашку на слой
     *
     * @param {string}      type        тип плашки
     * @param {int}         x           позиция плашки по оси X
     * @param {int}         y           позиция плашки по оси Y
     * @param {string}      orientation ориентация плашки
     * @param {null|int}    id          идентификатор плашки
     * @param {*}           properties  свойства плашки
     * @param {boolean}     animate     анимировать появление плашки
     * @param suppress_error
     *
     * @returns {null|int} идентификатор плашки
     */
    addPlate(type, x, y, orientation,
             id=null, properties=null, animate=false, suppress_error=false
    ) {
        if (!(typeof x !== "undefined") || !(typeof y !== "undefined") || !orientation) {
            throw new TypeError("All of 'type', 'x', 'y', and 'orientation' arguments must be defined");
        }

        let plate_class, plate;

        // TODO: Move to separate method. Use then in setPlates().
        if (id in this._plates && this._plates[id].type === type) {
            this._plates[id].rotate(orientation);
            return id;
        } else {
            plate_class = PlateLayer.typeToPlateClass(type);

            plate = new plate_class(this._plategroup, this.__grid, this.__schematic, this.__verbose, id, properties);
        }

        if (this._editable) {
            this._attachEventsEditable(plate);

            /// показать на плашке группу, отвечающую за информацию в состоянии редактируемости
            plate.showGroupEditable(true);

            plate.onChange((data) => this._callbacks.change(data));
        }

        try {
            plate.draw(this.__grid.cell(x, y), orientation, animate);
        } catch (err) {
            if (!suppress_error) {
                console.error("Cannot draw the plate", err);
            }

            plate.dispose();

            return null;
        }

        // Move old plate with same id to prevent overwriting
        // If this plate will exist after full board refresh, it can help when debugging
        if (plate.id in this._plates) {
            const old_plate = this._plates[plate.id];
            const randpostfix = Math.floor(Math.random() * (10 ** 6));
            this._plates[`_old_${plate.id}_#${randpostfix}`] = old_plate;
        }

        this._plates[plate.id] = plate;

        return plate.id;
    }

    addPlateSerialized(type, position, id, properties, animate, suppress_error) {
        const {cell: {x, y}, orientation} = position;

        return this.addPlate(type, x, y, orientation, id, properties, animate, suppress_error);
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
        for (let plate_id of Object.keys(this._plates)) {
            this._plates[plate_id].___touched = undefined;
            this._plates[plate_id].highlightError(false);
        }

        /// выполнить основной цикл
        for (let plate of plates) {
            /// если плашки нет, пропустить итерацию
            if (!plate) continue;

            // проверить, есть ли изменения
            if (!(plate.id in this._plates)) {is_dirty = true;}

            /// ИД новой/текущей плашки
            let id;

            /// экстра-параметр может называться по-другому
            // plate.extra = plate.extra || plate.number;

            /// добавить плашку, если таковой нет
            id = this.addPlateSerialized(plate.type, plate.position, plate.id, plate.properties);

            /// если плашка создана без ошибок / существует
            if (id != null) {
                /// пометить её
                this._plates[id].___touched = true;

                /// обновить состояние
                this.setPlateState(id, {
                    input: plate.dynamic && plate.dynamic.input,
                    output: plate.dynamic && plate.dynamic.output,
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
        if (!plate_ids) return;

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

        delete this._plates[id];

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

            document.removeEventListener('click', this._handleClick, false);
            document.removeEventListener('keydown', this._handleKey, false);
            document.removeEventListener('keyup',   this._handleKey, false);
            document.removeEventListener('contextmenu', this._handleContextMenu, false);

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

            if (editable) {
                plate.onChange(data => this._callbacks.change(data));
            } else {
                plate.onChange(null);
            }
        }

        document.addEventListener('click', this._handleClick, false);
        document.addEventListener('keydown', this._handleKey, false);
        document.addEventListener('keyup',   this._handleKey, false);
        document.addEventListener('contextmenu', this._handleContextMenu, false);

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
            evt.preventDefault();

            if (evt.target.classList.contains(ContextMenu.ItemClass)) return;
            if (evt.target.classList.contains(ContextMenu.ItemInputClass)) return;

            this.selectPlate(plate);

            if (evt.which === 1) {
                this._handlePlateMouseDown(evt, this._plate_selected);
            }
        });
    }

    selectPlate(plate) {
        /// Если плашка не была выделена ранее
        if (this._plate_selected && plate !== this._plate_selected) {
            /// Снять её выделение
            this._plate_selected.deselect();
            /// Отключить её события
            this.setPlateEditable(plate, false);
            // this._plate_selected.onChange(null);
        }

        /// Обрабатывать её события
        this.setPlateEditable(plate);
        // plate.onChange(this._callbacks.change);
        plate.onDragFinish(() => this._onPlateDragFinish(plate));
        plate.onDragStart(() => {
            this._onPlateDragStart(plate);
            this._callbacks.dragstart(plate);
        });

        /// выделить данную плашку
        this._plate_selected = plate;
        this._plate_selected.select();
    }

    /**
     * Сделать плашку редактируемой
     *
     * @param plate
     * @param editable
     *
     * @returns {boolean} принято ли изменение
     */
    setPlateEditable(plate, editable=true) {
        plate.setEditable(editable);

        if (editable) {
            plate.onMouseDown((evt) => this._handlePlateMouseDown(evt, plate));
            plate.onMouseWheel((evt) => this._onPlateMouseWheel(evt, plate));
        } else {
            plate.onMouseDown(null);
            plate.onMouseWheel(null);
        }
    }

    /**
     * Сгенерировать обработчик события нажатия кнопкой мыши по слою
     *
     * Если обработчик события был сгенерирован ранее, возвращается точно тот же обработчик.
     * Это можно использовать для открепления обработчика с помощью функции removeEventListener.
     *
     * @returns {function} обработчик события нажатия кнопкой мыши по слою
     *
     * @private
     */
    _handleClick(evt) {
        let el = evt.target;

        /// Определить, является ли элемент, по которому выполнено нажатие, частью плашки
        while ((el = el.parentElement) && !(el.classList.contains(Plate.Class))) {}

        /// Если не попали по плашке, но есть выделенная плашка
        if (!el && this._plate_selected) {
            /// Снять выделение
            this._plate_selected.deselect();

            /// Отключить её события
            this.setPlateEditable(this._plate_selected, false);
            // this._plate_selected.onChange(null);

            this._plate_selected = null;
        }
    }

    _handlePlateMouseDown(evt, plate) {
        if (evt.which === 1 && !this._plate_dragging) {
            plate.rearrange();

            document.body.addEventListener('mousemove', this._handleMouseMove, false);
            document.body.addEventListener('mouseup', this._handleMouseUp, false);

            this._cursor_point_mousedown = getCursorPoint(this._container.node, evt.clientX, evt.clientY);

            this._plate_dragging = plate;
            this._cell_supposed = plate._calcSupposedCell();
        }
    }

    _handleMouseMove(evt) {
        let cursor_point = getCursorPoint(this._container.node, evt.clientX, evt.clientY);

        let dx = cursor_point.x - this._cursor_point_mousedown.x;
        let dy = cursor_point.y - this._cursor_point_mousedown.y;

        this._cursor_point_mousedown = cursor_point;

        if (dx !== 0 || dy !== 0) {
            this._plate_dragging.dmove(dx, dy);
        }
    }

    _handleMouseUp(evt) {
        if (evt.which === 1) {
            document.body.removeEventListener('mousemove', this._handleMouseMove, false);
            document.body.removeEventListener('mouseup', this._handleMouseUp, false);

            // Snap & release
            this._plate_dragging.snap();
            this._plate_dragging = undefined;
        }
    }

    _onPlateMouseWheel(evt, plate) {
        if (evt.deltaY > 16) {
            plate.rotateClockwise();
        }

        if (evt.deltaY < -16) {
            plate.rotateCounterClockwise();
        }
    }

    /**
     * Сгенерировать обработчик вызова контекстного меню
     *
     * @returns  {function} обработчик вызова контекстного меню
     *
     * @private
     */
    _handleContextMenu(evt) {
        // ie 9+ only
        let el = evt.target;

        /// Определить, является ли элемент, по которому выполнено нажатие, частью плашки
        while ((el = el.parentElement) && !(el.classList.contains(Plate.Class))) {}

        /// Если элемент является частью плашки
        if (el) {
            evt.preventDefault();
            const plate = this._plate_selected;

            const ctxmenu = plate.getCmInstance();
            this._callContextMenu(ctxmenu, {x: evt.clientX, y: evt.clientY}, [plate.state.input]);
        }
    }

    /**
     * Сгенерировать обработчик события нажатия клавиши
     *
     * Если обработчик события был сгенерирован ранее, возвращается точно тот же обработчик.
     * Это можно использовать для открепления обработчика с помощью функции removeEventListener.
     *
     * @private
     */
    _handleKey(evt) {
        const keydown = evt.type === 'keydown';

        /// Если есть выделенная плашка
        if (this._plate_selected) {
            /// Убрать контекстное меню
            this._clearContextMenus();

            if (keydown) {
                switch (evt.code) {
                    case "Period": // >
                        this._plate_selected.inputIncrement();
                        evt.preventDefault();
                        break;
                    case "Comma": // <
                        this._plate_selected.inputDecrement();
                        evt.preventDefault();
                        break;
                    case "BracketRight":
                        this._plate_selected.rotateClockwise();
                        evt.preventDefault();
                        break;
                    case "BracketLeft":
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
        }

        this._plate_selected && this._plate_selected.handleKeyPress(evt.code, keydown);
    }

    /**
     * Обработать нажатие на пункт контекстного меню текущей плашки
     *
     * @param plate_id
     * @param {string} action_alias кодовое название пункта меню
     * @param value
     */
    handlePlateContextMenuItemClick(plate_id, action_alias, value) {
        if (!this._plates[plate_id]) return;

        const plate = this._plates[plate_id];

        switch (action_alias) {
            case PlateContextMenu.CMI_REMOVE: {
                this.removePlate(plate.id);
                break;
            }
            case PlateContextMenu.CMI_ROTCW: {
                this._plates[plate.id].rotateClockwise();
                break;
            }
            case PlateContextMenu.CMI_ROTCCW: {
                this._plates[plate.id].rotateCounterClockwise();
                break;
            }
            case PlateContextMenu.CMI_DUPLIC: {
                this._duplicatePlate(plate);
                break;
            }
            case PlateContextMenu.CMI_INPUT: {
                plate.setState({input: value});
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
            plate.props,
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
     * Перевести тип плашки в класс
     *
     * @param {string} type строковый тип плашки
     *
     * @returns {Plate} класс плашки
     */
    static typeToPlateClass(type: string): typeof Plate {
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
            case BuzzerPlate.Alias:         {return BuzzerPlate}
            case MotorPlate.Alias:          {return MotorPlate}
            case RGBPlate.Alias:            {return RGBPlate}
            case DummyPlate.Alias:          {return DummyPlate}
            case UnkPlate.Alias:            {return UnkPlate}
            default:                        {throw new RangeError(`Unknown plate type '${type}'`)}
        }
    }
}
