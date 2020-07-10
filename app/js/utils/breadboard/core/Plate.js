import Breadboard from "../Breadboard";
import Cell from "./Cell";
import Grid from "../core/Grid";
import PlateContextMenu from "../menus/PlateContextMenu";

function mod(n, m) {
  return ((n % m) + m) % m;
}

/**
 * Коды ориентаций
 *
 * @type {{West: string, North: string, East: string, South: string}}
 */
const ORIENTATIONS = {
    West:   'east',
    North:  'north',
    East:   'west',
    South:  'south',
    Dummy:  'dummy',
};

/**
 * Класс плашки доски
 *
 * @class
 * @abstract
 */
export default class Plate {
    // Ориентации плашки
    static get Orientations() {return ORIENTATIONS}
    // CSS-класс контейнера плашки
    static get Class() {return "bb-plate"}
    // Алиас контейнера плашки
    static get Alias() {return "default"}
    // CSS-класс изображения тени
    static get ShadowImgClass() {return "bb-plate-shadow-img"}

    static get QuadSizeDefault()    {return 24}
    static get LEDSizeDefault()     {return 16}
    static get LabelSizeDefault()   {return 12}

    constructor(container_parent, grid, schematic=false, verbose=false, id=null, extra=0) {
        if (!container_parent || !grid) {
            throw new TypeError("Both of container and grid arguments should be specified");
        }

        this.__grid = grid;

        this._node_parent = container_parent.node;

        /// Кодовое имя плашки
        this._alias = this.constructor.Alias;

        /// Идентификатор - по умолчанию случайная строка
        this._id = (id === null) ? (Math.floor(Math.random() * (10 ** 6))) : (id);

        /// Контейнер, группа и ссылка на сетку
        this._shadow        = container_parent.nested();        // для тени
        this._container     = container_parent.nested();        // для масштабирования
        this._shadowgroup   = this._shadow.group();             // для поворота тени
        this._group         = this._container.group();          // для поворота

        this._bezel         = undefined; // окантовка

        /// Дополнительные контейнеры
        this._group_editable = this._group.group();                     // для режима редактирования
        this._error_highlighter = undefined;

        /// Параметры - постоянные свойства плашки
        this._params = {
            size:       {x: 0, y: 0},   // кол-во ячеек, занимаемое плашкой на доске
            size_px:    {x: 0, y: 0},   // физический размер плашки (в px)
            origin:     {x: 0, y: 0},   // опорная точка плашки
            surface:    undefined,      // контур плашки
            rels:       undefined,      // относительные позиции занимаемых ячеек
            adjs:       undefined,      // корректировки положения плашки
            extra:      extra,          // доп. параметр
            schematic:  schematic,       // схематическое отображение плашки
            verbose:    verbose,       // схематическое отображение плашки
        };

        /// Состояние - изменяемые свойства плашки
        this._state = {
            cell:           new Cell(0, 0, this.__grid),    // ячейка, задающая положение опорной точки
            orientation:    Plate.Orientations.East,        // ориентация плашки
            highlighted:    false,                          // подсвечена ли плашка
            currents:       undefined,
            voltages:       undefined,
            input:          undefined,
            output:         undefined,
            cell_num:       undefined,
            contr_num:      undefined,
        };

        /// Присвоить класс контейнеру
        this._container.addClass(Plate.Class);

        /// Обработчики событий
        this._callbacks = {
            change: () => {},           // изменения плашки
            ctxmenuitemclick: () => {}, // нажатия на пункт контекстного меню
            dragstart: () => {},        // начала перетаскивания плашки
            dragfinish: () => {}        // конца перетаскивания плашки
        };

        /// Режим редактирования
        this._editable = false;
        /// Режим перетаскивания
        this._dragging = false;
        /// Отрисована ли была плашка
        this._drawn = false;
        /// Событие начала перетаскивания было инициировано
        this._dragstart_activated = false;

        this._ctxmenu = new (this.__cm_class__())(this._container, this.__grid, {id: this._id, schematic: this._params.schematic});
        this._ctxmenu.onItemClick((alias, value) => {this._callbacks.ctxmenuitemclick(alias, value)});

        this.showGroupEditable(false);
    }

    /**
     * Возвратить строку, определяющую тип плашки
     *
     * @returns {string}
     */
    get alias() {
        return this.constructor.Alias;
    }

    /**
     * Возвратить идентификатор плашки
     *
     * @returns {number|*} число, если задан идентификатор по умолчанию
     */
    get id() {
        return this._id;
    }

    get pos() {
        return this._state.cell.idx;
    }

    get extra() {
        return this._params.extra;
    }

    get length() {
        return this._params.size.x;
    }

    /**
     * Возвратить текущее состояние плашки
     *
     * @returns {{}} состояние плашки
     */
    get state() {
        return this._state;
    }

    get input() {
        return this._state.input;
    }

    /**
     * Возвратить HTML-элемент, содержащий плашку
     *
     * @returns {HTMLElement}
     */
    get container() {
        return this._container;
    }

    __cm_class__() {
        return PlateContextMenu;
    }

    /**
     * Функция индивидуальной отрисовки
     * Используется только у наследников данного класса
     *
     * @abstract
     * @private
     */
    __draw__() {
        throw new Error("Method should be implemented");
    }

    /**
     * Выдать "противоположную" ячейку
     *
     * Если cell - вход элемента, то, что выдаёт функция - выход элемента
     *
     * @param cell
     *
     * @abstract
     * @private
     */
    __getOppositeCell__(cell) {
        throw new Error("Method should be implemented");
    }

    /**
     * Нарисовать плашку
     *
     * @param {Cell}    cell        положение элемента относительно опорной точки
     * @param {string}  orientation ориентация элемента относительно опорной точки
     * @param {boolean} animate     анимировать появление плашки
     */
    draw(cell, orientation, animate=false) {
        this._checkParams();

        this._beforeReposition();

        let width   = (cell.size.x * this._params.size.x) + (this.__grid.gap.x * 2 * (this._params.size.x - 1));
        let height  = (cell.size.y * this._params.size.y) + (this.__grid.gap.y * 2 * (this._params.size.y - 1));

        this._container.size(width, height);
        this._shadow.size(width, height);

        let surf_path = this._generateSurfacePath(Breadboard.CellRadius);

        // TODO: Move surface generation to ComplexPlate and LinearPlate

        if (surf_path) {
            this._bezel = this._group.path(surf_path);
            this._error_highlighter = this._group.path(surf_path);
        } else {
            this._bezel = this._group.rect("100%", "100%").radius(Breadboard.CellRadius);
            this._error_highlighter = this._group.rect("100%", "100%").radius(Breadboard.CellRadius);
        }

        if (this._params.schematic) {
            this._bezel.fill({opacity: 0}).stroke({opacity: 0});
        } else {
            this._bezel.fill("#fffffd").stroke({color: "#f0eddb", width: 2});
        }

        this._error_highlighter.fill({color: "#f00"});

        this._shadowimg = this._shadowgroup.rect(width, height); // изображение тени
        this._shadowimg.fill({color: "#51ff1e"}).radius(10).opacity(0.4);
        this._shadowimg.addClass(Plate.ShadowImgClass);
        this._hideShadow();

        this.highlightError(false);
        this.move(cell, true);
        this.rotate(orientation, true);
        this.__draw__(cell, orientation);

        this._drawn = true;

        this._params.size_px.x = width;
        this._params.size_px.y = height;

        if (animate) {
            this._bezel.scale(1.15).animate('100ms').scale(1);
        }

        this._afterReposition();
    };

    /**
     * Установить состояние плашки
     *
     * @param {object} state новое состояние плашки, которое требуется отобразить
     * @param suppress_events
     */
    setState(state, suppress_events=false) {
        let is_dirty = false;

        for (let state_param in this._state) {
            if (state_param in state) {
                this._state[state_param] = state[state_param];

                is_dirty = true;
            }
        }

        if (!suppress_events) {
            if (is_dirty) {
                this._callbacks.change({
                    id: this._id,
                    action: 'state'
                });
            }
        }
    }

    /**
     * Выделить ошибку
     *
     * @param on
     */
    highlightError(on=false) {
        if (on) {
            // установить подсветку ошибки
            this._error_highlighter.opacity(0.3);
        } else {
            // снять подсветку ошибки
            this._error_highlighter.opacity(0);
        }
    }

    /**
     * Сымитировать клик на плашку
     */
    click() {
        this._container.fire('mousedown');
        this._rearrange();
    }

    /**
     * Переместить плашку в новую клетку
     *
     * @param {Cell}    cell            положение плашки относительно опорной точки
     * @param {boolean} suppress_events подавить инициацию событий
     * @param {boolean} animate         анимировать перемещение
     */
    move(cell, suppress_events=false, animate=false) {
        if (cell.__grid !== this.__grid) {
            throw new Error("Cell's grid and plate's grid are not the same");
        }

        if (!suppress_events) {
            this._beforeReposition();
        }

        if (this._ctxmenu.active) {return}

        this._state.cell = cell;

        let pos = this._getPositionAdjusted(cell);

        this._shadow.move(pos.x, pos.y);

        if (animate) {
            this._container.animate('100ms', '<>').move(pos.x, pos.y);
        } else {
            this._container.move(pos.x, pos.y);
        }

        if (!suppress_events) {
            this._afterReposition();

            this._callbacks.change({
                id: this._id,
                action: 'move'
            });
        }
    }

    /**
     * Сместить плашку на (dx, dy) позиций по осям X и Y соответственно
     *
     * @param {int}     dx                  смещение по оси X
     * @param {int}     dy                  смещение по оси Y
     * @param {boolean} prevent_overflow    предотвращать выход за пределы сетки
     */
    shift(dx, dy, prevent_overflow=true) {
        this.move(this.__grid.cell(this._state.cell.idx.x + dx, this._state.cell.idx.y + dy, Grid.BorderTypes.Replicate));

        if (prevent_overflow) {
            this._preventOverflow();
        }
    }

    /**
     * Повернуть плашку
     *
     * @param {string}  orientation         ориентация плашки относительно опорной точки
     * @param {boolean} suppress_events     подавить инициацию событий
     * @param {boolean} prevent_overflow    предотвращать выход за пределы сетки
     */
    rotate(orientation, suppress_events=false, prevent_overflow=true) {
        if (this._dragging) return;
        if (this._ctxmenu.active) {return}

        if (orientation === this._state.orientation) {return}

        if (orientation === Plate.Orientations.Dummy) {
            console.debug('invalid orientation: dummy');
            return;
        }

        if (!suppress_events) {
            this._beforeReposition();
        }

        let angle = Plate._orientationToAngle(orientation);

        let cell = this._state.cell;

        let anchor_point = {
            x: (this._params.origin.x * (this.__grid.gap.x * 2 + cell.size.x)) + (cell.size.x / 2),
            y: (this._params.origin.y * (this.__grid.gap.y * 2 + cell.size.y)) + (cell.size.y / 2),
        };

        this._group.transform({rotation: angle, cx: anchor_point.x, cy: anchor_point.y});
        this._shadowgroup.transform({rotation: angle, cx: anchor_point.x, cy: anchor_point.y});

        this._state.orientation = orientation;

        if (!suppress_events) {
            this._afterReposition();

            this._callbacks.change({
                id: this._id,
                action: 'rotate'
            })
        }

        if (prevent_overflow) {
            this._preventOverflow();
        }
    }

    /**
     * Повернуть плашку по часовой стрелке
     */
    rotateClockwise() {
        let orientation;

        switch (this._state.orientation) {
            case Plate.Orientations.East: {orientation = Plate.Orientations.South; break}
            case Plate.Orientations.South: {orientation = Plate.Orientations.West; break}
            case Plate.Orientations.West: {orientation = Plate.Orientations.North; break}
            case Plate.Orientations.North: {orientation = Plate.Orientations.East; break}

            default: {throw new TypeError("Current orientation is invalid")}
        }

        this.rotate(orientation);
    }

    /**
     * Повернуть плашку по часовой стрелке
     */
    rotateCounterClockwise() {
        let orientation;

        switch (this._state.orientation) {
            case Plate.Orientations.East: {orientation = Plate.Orientations.North; break}
            case Plate.Orientations.South: {orientation = Plate.Orientations.East; break}
            case Plate.Orientations.West: {orientation = Plate.Orientations.South; break}
            case Plate.Orientations.North: {orientation = Plate.Orientations.West; break}

            default: {throw new TypeError("Current orientation is invalid")}
        }

        this.rotate(orientation);
    }

    /**
     * Выделить контур плашки
     */
    select() {
        this._rearrange();

        if (this._params.schematic) {
            this._bezel.animate('100ms').stroke({opacity: 1, color: "#0900fa", width: 2});
        } else {
            this._bezel.animate('100ms').stroke({color: "#0900fa", width: 2});
        }

        this.highlightError(false);
    }

    /**
     * Снять выделение контура плашки
     */
    deselect() {
        if (this._params.schematic) {
            this._bezel.animate('100ms').stroke({opacity: 0, color: "#f0eddb", width: 2});
        } else {
            this._bezel.animate('100ms').stroke({color: "#f0eddb", width: 2});
        }
    }

    /**
     * Удалить плашку
     */
    dispose() {
        this._beforeReposition();

        // this._bezel.scale(1).animate('100ms').scale(0.85).opacity(0);

        // setTimeout(() => {
        this._container.node.remove();
        this._shadow.node.remove();
        // }, 100);

        this._afterReposition();
    }

    getOppositeCell(cell) {
        return this.__getOppositeCell__(cell);
    }

    /**
     * Сделать плашку редактируемой
     *
     * @param   {HTMLElement}   svg_main SVG-элемент в DOM, содержащий плашку
     *
     * @returns {boolean} принято ли изменение
     */
    setEditable(svg_main) {
        /// если svg не задан, отключить и выйти
        if (!svg_main) {
            this._container.style({cursor: 'default'});
            this._group.off();      // отключить все обработчики
            this._editable = false;
            return true;
        }

        /// если svg задан, но уже включено, выйти
        if (this._editable) {
            return true;
        }

        /// если svg задан, но не включено, включить
        this._editable = true;

        this._container.style({cursor: 'move'});

        let cursor_point_last = undefined;

        let cell_supposed = this._calcSupposedCell();

        /// обработчик перетаскивания плашки
        let onmove = (evt) => {
            let cursor_point = Breadboard._getCursorPoint(svg_main, evt.clientX, evt.clientY);

            let dx = cursor_point.x - cursor_point_last.x;
            let dy = cursor_point.y - cursor_point_last.y;

            this._container.dmove(dx, dy);

            cursor_point_last = cursor_point;

            cell_supposed = this._calcSupposedCell();
            this._dropShadowToCell(cell_supposed);

            if (dx > 0 || dy > 0) {
                this._dragging = true;

                if (!this._dragstart_activated) {
                    this._showShadow();
                    this._callbacks.dragstart();
                    this._dragstart_activated = true;
                }
            }
        };

        let onmouseup = (evt) => {
            if (evt.which === 1) {
                document.body.removeEventListener('mousemove', onmove, false);
                document.body.removeEventListener('mouseup', onmouseup, false);

                // Snap
                this.move(cell_supposed, false, true);
                this._hideShadow();

                this._dragging = false;
                this._dragstart_activated = false;
                this._callbacks.dragfinish();
            }
        };

        /// обработчик нажатия кнопки мыши на плашке
        this._group.mousedown((evt) => {
            if (evt.which === 1 && !this._dragging) {
                this._rearrange();

                document.body.addEventListener('mousemove', onmove, false);
                document.body.addEventListener('mouseup', onmouseup, false);

                cursor_point_last = Breadboard._getCursorPoint(svg_main, evt.clientX, evt.clientY);
            }
        });

        /// отбработчик вращения колёсика мыши на плашке
        if (this._group.node.addEventListener) {
            if ('onwheel' in document) {
                // IE9+, FF17+, Ch31+
                this._group.node.removeEventListener("wheel", this.onWheel());
                this._group.node.addEventListener("wheel", this.onWheel());
            } else if ('onmousewheel' in document) {
                // устаревший вариант события
                this._group.node.removeEventListener("mousewheel", this.onWheel());
                this._group.node.addEventListener("mousewheel", this.onWheel());
            } else {
                // Firefox < 17
            this._group.node.removeEventListener("MozMousePixelScroll", this.onWheel());
            this._group.node.addEventListener("MozMousePixelScroll", this.onWheel());
            }
        } else { // IE8-
            this._group.node.attachEvent("onmousewheel", this.onWheel());
        }

        this._editable = true;
        return true;
    }

    /**
     * Показать группу для режима редактирования
     *
     * @param on
     */
    showGroupEditable(on=false) {
        if (on) {
            this._group_editable.opacity(1);
        } else {
            this._group_editable.opacity(0);
        }
    }

    /**
     * Установить обработчик события изменения плашки
     *
     * @param {function} cb обработчик события изменения плашки
     */
    onChange(cb) {
        if (!cb) {cb = () => {}};

        this._callbacks.change = cb;
    }

    /**
     * Установить обработчик события вращения колёсика мыши на плашке
     */
    onWheel() {
        if (this._onwheel) {
            return this._onwheel;
        }

        this._onwheel = (evt) => {
            if (evt.deltaY > 16) {
                this.rotateClockwise();
            }

            if (evt.deltaY < -16) {
                this.rotateCounterClockwise();
            }
        };

        return this._onwheel;
    }

    /**
     * Установить обработчик начала перетаскивания плашки
     *
     * @param {function} cb обработчик начала перетаскивания плашки
     */
    onDragStart(cb) {
        if (!cb) {this._callbacks.dragstart = () => {}}

        this._callbacks.dragstart = cb;
    }

    /**
     * Установить обработчик конца перетаскивания плашки
     *
     * @param {function} cb обработчик конца перетаскивания плашки
     */
    onDragFinish(cb) {
        if (!cb) {this._callbacks.dragfinish = () => {}}

        this._callbacks.dragfinish = cb;
    }

    /**
     * Установить обработчик нажатия на пункт контекстного меню плашки
     *
     * @param {function} cb обработчик нажатия на пункт контекстного меню плашки.
     */
    onContextMenuItemClick(cb) {
        if (!cb) {this._callbacks.ctxmenuitemclick = () => {}}

        this._callbacks.ctxmenuitemclick = cb;
    }

    /**
     * Отобразить контекстное меню плашки
     *
     * @param {MouseEvent}      evt         событие нажатия кнопки мыши
     * @param {HTMLElement}     svg_main    родительский SVG-узел
     */
    showContextMenu(evt, svg_main) {
        if (this._dragging) return;

        let cursor_point = Breadboard._getCursorPoint(svg_main, evt.clientX, evt.clientY);

        this._ctxmenu.draw(cursor_point, true, [this._state.input]);
    }

    /**
     * Скрыть контекстное меню плашки
     */
    hideContextMenu() {
        this._ctxmenu.dispose();
    }

    /**
     * "Заморозить" плашку
     *
     * Плашка не реагирует на события мыши и становится полупрозрачной.
     * Необходимо для предотвращения конфликтов при перетаскивании
     */
    freeze() {
        this._container.style('pointer-events', 'none');
        this._container.animate('100ms').opacity(0.5);
    }

    /**
     * "Разморозить" плашку
     *
     * {@link Plate.freeze}
     */
    unfreeze() {
        this._container.style('pointer-events', 'inherit');
        this._container.animate('100ms').opacity(1);
    }

    /**
     * Инициализировать плашку
     *
     * @private
     */
    _checkParams() {
        if (this._params.origin.x >= this._params.size.x || this._params.origin.y >= this._params.size.y) {
            this._params.origin = {x: 0, y: 0};
            console.debug(`Invalid origin for plate type '${this._alias}'`);
        }
    }

    /**
     * Отобразить тень на предполагаемой ближайшей ячейке
     *
     * @private
     */
    _dropShadowToCell(cell) {
        let pos = this._getPositionAdjusted(cell);

        this._shadow.x(pos.x);
        this._shadow.y(pos.y);
    }

    /**
     * Показать тень плашки
     *
     * @private
     */
    _showShadow() {
        this._shadow.opacity(1);
    }

    /**
     * Скрыть тень плашки
     *
     * @private
     */
    _hideShadow() {
        this._shadow.opacity(0);
    }

    /**
     * Вычислить предполагаемую ближайшую ячейку
     *
     * @private
     */
    _calcSupposedCell() {
        /// Положениие группы плашки (изм. при вращении)
        let gx = this._group.x(),
            gy = this._group.y();

        /// Положение контейнера плашки (изм. при перемещении)
        let cx = this._container.x(),
            cy = this._container.y();

        /// Размер контейнера плашки
        let spx = this._params.size_px.x,
            spy = this._params.size_px.y;

        /// Координаты верхнего левого угла контейнера
        let x = 0,
            y = 0;

        // Учесть влияние вращения на систему координат
        switch (this._state.orientation) {
            case Plate.Orientations.East:   {x = cx;                y = cy;             break;}
            case Plate.Orientations.North:  {x = cx + gx - spy;     y = cy + gy;        break;}
            case Plate.Orientations.West:   {x = cx + gx - spx;     y = cy + gy - spy;  break;}
            case Plate.Orientations.South:  {x = cx + gx;           y = cy + gy - spx;  break;}
        }

        let cell = this.__grid.getCellByPos(x, y, Grid.BorderTypes.Replicate);
        let cell_orig = this._getCellOriginal(cell);

        let [Ox, Oy, Nx, Ny] = this._getPlacementConstraints(this._state.orientation);

        /// Индекс ячейки, находящейся под опорной ячейкой плашки
        let ix = cell_orig.idx.x,
            iy = cell_orig.idx.y;

        /// Точное положение опорной точки плашки в системе координат
        let px = x - cell.pos.x + cell_orig.pos.x,
            py = y - cell.pos.y + cell_orig.pos.y;

        /// Проверка на выход за границы сетки ячеек
        if (ix <= Ox)   {ix = Ox}
        if (iy <= Oy)   {iy = Oy}

        if (ix >= Nx)   {ix = Nx}
        if (iy >= Ny)   {iy = Ny}

        /// Массив соседей ячейки, над которой находится плашка
        let neighbors = [];

        /// Соседи по краям
        if (ix + 1 < Nx)    neighbors.push(this.__grid.cell(ix + 1, iy));
        if (ix - 1 >= Ox)   neighbors.push(this.__grid.cell(ix - 1, iy));
        if (iy + 1 < Ny)    neighbors.push(this.__grid.cell(ix, iy + 1));
        if (iy - 1 >= Oy)   neighbors.push(this.__grid.cell(ix, iy - 1));

        /// Соседи по диагоналям
        if (ix + 1 < Nx && iy + 1 < Ny)     neighbors.push(this.__grid.cell(ix + 1, iy + 1));
        if (ix + 1 < Nx && iy - 1 >= Oy)    neighbors.push(this.__grid.cell(ix + 1, iy - 1));
        if (ix - 1 >= Ox && iy + 1 < Ny)    neighbors.push(this.__grid.cell(ix - 1, iy + 1));
        if (ix - 1 >= Ox && iy - 1 >= Oy)   neighbors.push(this.__grid.cell(ix - 1, iy - 1));

        /// Ближайший сосед
        let nearest = this.__grid.cell(ix, iy);

        // Расстояния от точки до ближайшего соседа
        let ndx = Math.abs(px - nearest.pos.x);
        let ndy = Math.abs(py - nearest.pos.y);

        for (let neighbor of neighbors) {
            /// Расстояния от точки до соседа
            let dx = Math.abs(px - neighbor.pos.x);
            let dy = Math.abs(py - neighbor.pos.y);

            if (dx < ndx || dy < ndy) {
                // если хотя бы по одному измерению расстояние меньше,
                // взять нового ближайшего соседа
                nearest = neighbor;
                ndx = Math.abs(px - nearest.pos.x);
                ndy = Math.abs(py - nearest.pos.y);
            }
        }

        return nearest;
    }

    _getPlacementConstraints(orientation) {
        if (!this._constraints) {
            this._constraints = this._calcPlacementConstraints();
        }

        return this._constraints[orientation];
    }

    _calcPlacementConstraints() {
        /// Размерность доски
        let Dx = this.__grid.dim.x,
            Dy = this.__grid.dim.y;

        /// Размерность плашки
        let Sx = this._params.size.x,
            Sy = this._params.size.y;

        /// Опорная точка плашки
        let orn = this._params.origin;

        /// Количество точек от опорной до края
        let rem = {x: Sx - orn.x, y: Sy - orn.y};

        let constraints = [];

        // x goes to Nx, y goes to Ny
        constraints[Plate.Orientations.East] =  [orn.x,          orn.y,         Dx - rem.x,        Dy - rem.y];
        // -y goes to Nx, x goes to Ny
        constraints[Plate.Orientations.North] = [rem.y - 1,      orn.x,         Dx - orn.y - 1,    Dy - rem.x];
        // -x goes to Nx, -y goes to Ny
        constraints[Plate.Orientations.West] =  [rem.x - 1,      rem.y - 1,     Dx - orn.x - 1,    Dy - orn.y - 1];
        // y goes to Nx, -x goes to Ny
        constraints[Plate.Orientations.South] = [orn.y,          rem.x - 1,     Dx - rem.y,        Dy - orn.x - 1];

        return constraints;
    }

    /**
     * Определить ячейку, над которой находится опорная точка плашки
     *
     * @param cell          ячейка, над которой находится верхняя левая точка плашки
     * @returns {Cell|*}    ячейка, над которой находится опорная точка плашки
     *
     * @private
     */
    _getCellOriginal(cell) {
        let ix = cell.idx.x,
            iy = cell.idx.y;

        let orn = this._params.origin;

        /// Количество ячеек, занимаемое плашкой
        let sx = this._params.size.x,
            sy = this._params.size.y;

        let dix = 0,
            diy = 0;

        switch (this._state.orientation) {
            case Plate.Orientations.East:   {dix = orn.x;             diy = orn.y;              break;}
            case Plate.Orientations.North:  {dix = sy - orn.y - 1;    diy = orn.x;              break;}
            case Plate.Orientations.West:   {dix = sx - orn.x - 1;    diy = sy - orn.y - 1;     break;}
            case Plate.Orientations.South:  {dix = orn.y;             diy = sx - orn.x - 1;     break;}
        }

        return this.__grid.cell(ix + dix, iy + diy, Grid.BorderTypes.Replicate);
    }

    /**
     * Предотвратить выход плашки за пределы сетки
     *
     * Вызывается при смене положения и ориентации (как ручном, так и автоматическом)
     *
     * @private
     */
    _preventOverflow() {
        /// Номер ячейки, занимаемой опорной ячейкой плашки
        let ix = this._state.cell.idx.x,
            iy = this._state.cell.idx.y;

        let [Ox, Oy, Nx, Ny] = this._getPlacementConstraints(this._state.orientation);

        let dx = 0,
            dy = 0;

        if (ix >= Nx) {dx = Nx - ix}
        if (iy >= Ny) {dy = Ny - iy}

        if (ix <= Ox) {dx = Ox - ix}
        if (iy <= Oy) {dy = Oy - iy}

        ix += dx;
        iy += dy;

        // анимировать, но только не в случае незавершённой отрисовки
        this.move(this.__grid.cell(ix, iy), false, this._drawn);
    }

    /**
     * Переставить плашку в DOM-дереве выше остальных
     *
     * Используется в случах, когда плашку необходимо отображать поверх остальных
     *
     * @private
     */
    _rearrange() {
        let node_temp = this._container.node;
        this._container.node.remove();
        this._node_parent.appendChild(node_temp);
    }


    /**
     * Выполнить действия, требуемые до перемещения плашки
     *
     * Каждый раз, когда плашка перемещается, необходимо "освободить" ячейки,
     * занимаемые плашкой ранее, для повторного расчёта токов.
     *
     * @private
     */
    _beforeReposition() {
        // Освободить все ячейки, занимаемые плашкой
        this._reoccupyCells(true);
    }

    /**
     * Выполнить действия, требуемые после перемещения плашки
     *
     * Каждый раз, когда плашка перемещается, необходимо "занять" ячейки,
     * которые будут заняты плашкой, для повторного расчёта токов.
     *
     * @private
     */
    _afterReposition() {
        // Занять все ячейки, занимаемые плашкой
        this._reoccupyCells();
    }

    /**
     * Занять/освободить ячейки, занимаемые данной плашкой на данной позиции
     * ВНЕ СХЕМАТИЧЕСКОГО РЕЖИМА: Не запускается
     *
     * @param {boolean} clear освободить ячейки
     * @private
     */
    _reoccupyCells(clear=false) {
        if (!this._params.schematic) return;

        if (!this._params.rels) return;

        let abs = this.state.cell.idx;

        for (let _rel of this._params.rels) {
            // ориентировать относительную ячейку плашки
            let rel = Plate._orientXYObject(_rel, this._state.orientation);
            // определить корректировку для отрисовки тока
            let adj_cur = clear ? null : Plate._orientXYObject(_rel.adj, this._state.orientation);
            // определить корректировку положения всей плашки
            let adj_pos = this._params.adjs ? this._params.adjs[this._state.orientation] : null;

            // учесть, что корректировка положения всей плашки может отсутствовать
            if (adj_pos) {
                adj_pos = {x: adj_pos.x ? adj_pos.x : 0, y: adj_pos.y ? adj_pos.y : 0}
            } else {
                adj_pos = {x: 0, y: 0};
            }

            // сообщить ячейке полученную корректировку
            try {
                let cell = this.__grid.cell(abs.x + rel.x + adj_pos.x, abs.y + rel.y + adj_pos.y);

                let opposite = clear ? null : this.getOppositeCell(cell);

                cell.reoccupy(adj_cur, opposite);
            } catch (e) {
                console.debug("Tried to get a non-existent cell (in purpose to reoccupy)",
                    abs.x + rel.x, abs.y + rel.y
                );
            }
        }
    }

    /**
     * Возвратить подогнанные координаты для установки плашки
     *
     * ВНЕ СХЕМАТИЧЕСКОГО РЕЖИМА: Координаты не подгоняются
     *
     * @param {Cell|null} cell Ячейка, если не указано - использовать текущую ячейку из состояния
     *
     * @returns {*} координаты с учётном подгонки
     * @private
     */
    _getPositionAdjusted(cell=null) {
        cell = cell || this._state.cell;

        /// Опорная точка плашки
        let orn = this._params.origin;

        /// Абсолютное положение плашки с учётом того, что ячейка лежит над опорной точкой плашки
        let abs = {
            x: cell.pos.x - orn.x * (cell.size.x + this.__grid.gap.x * 2),
            y: cell.pos.y - orn.y * (cell.size.y + this.__grid.gap.y * 2)
        };

        if (!this._params.schematic) {
            return abs;
        }

        if (!this._params.adjs || !this._params.adjs[this._state.orientation]) {
            return abs;
        }

        let adj = this._params.adjs[this._state.orientation];

        return {x: abs.x + adj.x * cell.size.x, y: abs.y + adj.y * cell.size.y};
    }

    _generateSurfacePath(radius=5) {
        if (this._params.surface) {
            let path = [];

            // TODO: Verify closed surfaces

            let surfcnt = this._convertSurfaceToArray(this._params.surface);

            if (!surfcnt) return;

            let surf_point = this._params.surface[0];
            let cell = this.__grid.cell(surf_point.x, surf_point.y);

            return path.concat(this._buildSurfacePath(cell, surfcnt, radius));
        }
    }

    _buildSurfacePath(cell, surfcnt, radius, dir_idx=0, is_root=true) {
        let path = [];

        // clockwise dir sequence
        let dirs = Cell.DirectionsClockwise;

        if (is_root) {
            path = path.concat(this._buildSurfacePathOffset(cell, radius));
        }

        // main drawing procedure
        while (surfcnt[cell.idx.x][cell.idx.y] < dirs.length) {
            dir_idx = mod(dir_idx, dirs.length);

            let dir = dirs[dir_idx % dirs.length];

            // get neighbor cell for current direction
            let nb = cell.neighbor(dir);

            if (nb && surfcnt[nb.idx.x] && surfcnt[nb.idx.x].hasOwnProperty(nb.idx.y)) {
                surfcnt[cell.idx.x][cell.idx.y] += 1;

                // skip to suppress redundant deepening
                if (surfcnt[nb.idx.x][nb.idx.y] <= 0) {
                    let dir_idx_prev = mod(dir_idx-1, dirs.length);
                    let dir_prev = dirs[dir_idx_prev % dirs.length];

                    let dir_idx_next = mod(dir_idx+1, dirs.length);
                    let dir_next = dirs[dir_idx_next % dirs.length];

                    // push gap
                    path = path.concat(this._buildSurfacePathGapPush(dir, dir_prev, radius));
                    // if neighbor exists for this direction, draw from it
                    path = path.concat(this._buildSurfacePath(nb, surfcnt, radius, dir_idx - 1, false));
                    // pull gap
                    path = path.concat(this._buildSurfacePathGapPull(dir, dir_next, radius));
                }
            } else {
                // otherwise we can draw the edge of this direction
                surfcnt[cell.idx.x][cell.idx.y] += 1;

                path = path.concat(this._buildSurfacePathEdge(cell, dir, radius));
            }

            dir_idx++;
        }

        if (is_root) {
            path.push(this._buildSurfacePathClosure(dirs[0], radius));
        }

        return path;
    }

    _buildSurfacePathGapPush(dir, dir_corner, radius) {
        let corner = this._buildSurfacePathCorner(dir_corner, radius);

        if (corner === null) {
            radius = 0;
            corner = [];
        }

        switch (dir) {
            case Cell.Directions.Up: {
                return [corner, ['v', -(this.__grid.gap.y * 2 - radius*2)]]; // draw up
            }
            case Cell.Directions.Right: {
                return [corner, ['h', +(this.__grid.gap.x * 2 - radius*2)]]; // draw right
            }
            case Cell.Directions.Down: {
                return [corner, ['v', +(this.__grid.gap.y * 2 - radius*2)]]; // draw down
            }
            case Cell.Directions.Left: {
                return [corner, ['h', -(this.__grid.gap.x * 2 - radius*2)]]; // draw left
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }
    }

    _buildSurfacePathGapPull(dir, dir_corner, radius) {
        let corner = this._buildSurfacePathCorner(dir_corner, radius);

        if (corner === null) {
            radius = 0;
            corner = [];
        }

        switch (dir) {
            case Cell.Directions.Up: {
                return [corner, ['v', +(this.__grid.gap.y * 2 - radius*2)]]; // draw down
            }
            case Cell.Directions.Right: {
                return [corner, ['h', -(this.__grid.gap.x * 2 - radius*2)]]; // draw left
            }
            case Cell.Directions.Down: {
                return [corner, ['v', -(this.__grid.gap.y * 2 - radius*2)]]; // draw up
            }
            case Cell.Directions.Left: {
                return [corner, ['h', +(this.__grid.gap.x * 2 - radius*2)]]; // draw right
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }
    }

    _buildSurfacePathEdge(cell, dir, radius) {
        let corner = this._buildSurfacePathCorner(dir, radius);

        if (corner === null) {
            radius = 0;
            corner = [];
        }

        switch (dir) {
            case Cell.Directions.Up: {
                return [corner, ['h', +(cell.size.x - radius*2)]]; // draw right
            }
            case Cell.Directions.Right: {
                return [corner, ['v', +(cell.size.y - radius*2)]]; // draw down
            }
            case Cell.Directions.Down: {
                return [corner, ['h', -(cell.size.x - radius*2)]]; // draw left
            }
            case Cell.Directions.Left: {
                return [corner, ['v', -(cell.size.y - radius*2)]]; // draw up
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }
    }

    _buildSurfacePathOffset(cell, radius) {
        let mv_x = (cell.idx.x * (cell.size.x + this.__grid.gap.x * 2)),
            mv_y = (cell.idx.y * (cell.size.y + this.__grid.gap.y * 2));

        return [['M', mv_x + radius, mv_y]];
    }

    _buildSurfacePathClosure(dir_curr, radius) {
        if (this._dir_prev == null) return [];

        let closure = this._buildSurfacePathCorner(dir_curr, radius);

        this._dir_prev = null;

        return closure;
    }

    _buildSurfacePathCorner(dir_curr, radius) {
        let dir_prev = this._dir_prev;

        if (dir_curr === dir_prev) return null;

        let rx = null,
            ry = null;

        let arc = null;

        if (Cell.IsDirHorizontal(dir_prev) && Cell.IsDirVertical(dir_curr)) {
            rx = (dir_prev === Cell.Directions.Up)      ? radius : -radius;
            ry = (dir_curr === Cell.Directions.Right)    ? radius : -radius;
        }

        if (Cell.IsDirHorizontal(dir_curr) && Cell.IsDirVertical(dir_prev)) {
            rx = (dir_curr === Cell.Directions.Up)      ? radius : -radius;
            ry = (dir_prev === Cell.Directions.Right)    ? radius : -radius;
        }

        if (rx !== null && ry !== null) {
            let cw = Cell.IsDirsClockwise(dir_prev, dir_curr) ? 1 : 0;
            arc = ['a', radius, radius, 0, 0, cw, rx, ry];
        }

        let is_first = this._dir_prev == null;

        this._dir_prev = dir_curr;

        return is_first ? [] : arc;
    }

    /**
     *
     * @param surface Array<object>
     * @private
     */
    _convertSurfaceToArray(surface) {
        let arr = [];

        for (let item of surface) {
            if (!arr.hasOwnProperty(item.x)) arr[item.x] = [];

            arr[item.x][item.y] = 0;

            if (arr[item.x].length > this._params.size.y) {
                console.error("Invalid surface for Y size, skipping custom bezel");
                return;
            }

            if (arr.length > this._params.size.x) {
                console.error("Invalid surface for X size, skipping custom bezel");
                return;
            }
        }

        return arr;
    }

    static IsOrientationHorizontal(orientation) {
        return (orientation === Plate.Orientations.West || orientation === Plate.Orientations.East);
    }

    static IsOrientationVertical(orientation) {
        return (orientation === Plate.Orientations.North || orientation === Plate.Orientations.South);
    }

    /**
     * Перевести строку, задающую ориентацию плашки, в значение угла поворота
     *
     * @param {string} orientation ориентация плашки
     *
     * @returns {number} угол поворота в градусах
     * @private
     */
    static _orientationToAngle(orientation) {
        switch (orientation) {
            case Plate.Orientations.East:            {return 0}
            case Plate.Orientations.North:           {return 90}
            case Plate.Orientations.West:            {return 180}
            case Plate.Orientations.South:           {return 270}
            default: {throw new TypeError(`Invalid 'orientation' argument: ${orientation}`)}
        }
    }

    static _orientXYObject(xyobj, orientation) {
        let xynew = {};

        switch (orientation) {
            case Plate.Orientations.East:   {xynew.x = xyobj.x;    xynew.y = xyobj.y;     break;}
            case Plate.Orientations.South:  {xynew.x = xyobj.y;    xynew.y = -xyobj.x;    break;}
            case Plate.Orientations.West:   {xynew.x = -xyobj.x;   xynew.y = -xyobj.y;    break;}
            case Plate.Orientations.North:  {xynew.x = -xyobj.y;   xynew.y = xyobj.x;     break;}
            default: {throw new TypeError(`Invalid 'orientation' argument: ${orientation}`)}
        }

        return xynew;
    }
}