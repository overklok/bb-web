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

    static get QuadSizeDefault()    {return 16}
    static get LEDSizeDefault()     {return 16}
    static get LabelSizeDefault()   {return 12}

    constructor(container_parent, grid, schematic=false, id=null, extra=0) {
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
        this._error_highlighter = this._group.rect("100%", "100%");     // для подсветки

        // TODO: Highlight Error for Path Plates
        // FIXME: Supposed Cell calculation errors

        /// Параметры - постоянные свойства плашки
        this._params = {
            size:       {x: 0, y: 0},   // кол-во ячеек, занимаемое плашкой на доске
            size_px:    {x: 0, y: 0},   // физический размер плашки (в px)
            origin:     {x: 0, y: 0},   // опорная точка плашки
            surface:    undefined,      // контур плашки
            rels:       undefined,      // относительные позиции занимаемых ячеек
            adjs:       undefined,      // корректировки положения плашки
            extra:      extra,          // доп. параметр
            schematic:  schematic       // схематическое отображение плашки
        };

        /// Состояние - изменяемые свойства плашки
        this._state = {
            cell:           new Cell(0, 0, this.__grid),    // ячейка, задающая положение опорной точки
            orientation:    Plate.Orientations.East,        // ориентация плашки
            highlighted:    false,                          // подсвечена ли плашка
            currents:       undefined,
            voltages:       undefined,
            adc:            undefined,
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
        this._drawed = false;
        /// Событие начала перетаскивания было инициировано
        this._dragstart_activated = false;

        this._ctxmenu = new PlateContextMenu(this._container, this.__grid, {id: this._id, schematic: this._params.schematic});
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

    /**
     * Возвратить текущее состояние плашки
     *
     * @returns {{}} состояние плашки
     */
    get state() {
        return this._state;
    }

    /**
     * Возвратить HTML-элемент, содержащий плашку
     *
     * @returns {HTMLElement}
     */
    get container() {
        return this._container;
    }

    /**
     * Функция индивидуальной отрисовки
     * Используется только у наследников данного класса
     *
     * @abstract
     * @private
     */
    __draw__() {
        // stub
    }

    /**
     * Нарисовать плашку
     *
     * @param {Cell}    cell        положение элемента относительно опорной точки
     * @param {string}  orientation ориентация элемента относительно опорной точки
     */
    draw(cell, orientation, animate=false) {
        this._beforeReposition();

        let width   = (cell.size.x * this._params.size.x) + (this.__grid.gap.x * 2 * (this._params.size.x - 1));
        let height  = (cell.size.y * this._params.size.y) + (this.__grid.gap.y * 2 * (this._params.size.y - 1));

        this._container.size(width, height);
        this._shadow.size(width, height);

        let surf_path = this._generateSurfacePath(Breadboard.CellRadius);

        if (surf_path) {
            this._bezel = this._group.path(surf_path).fill("#fffffd");
            // this._bezel.fill({opacity: 0});
        } else {
            this._bezel = this._group.rect("100%", "100%");
            this._bezel.radius(Breadboard.CellRadius).fill("#fffffd");
        }

        this._bezel.stroke({color: "#f0eddb", width: 2});

        if (this._params.schematic) {
            this._bezel.fill({opacity: 0});
            this._bezel.stroke({opacity: 0})
        }

        this._error_highlighter.fill({color: "#f00"}).radius(10);

        this._shadowimg = this._shadowgroup.rect(width, height); // изображение тени
        this._shadowimg.fill({color: "#51ff1e"}).radius(10).opacity(0.4);
        this._shadowimg.addClass(Plate.ShadowImgClass);
        this._hideShadow();

        this.highlightError(false);
        this.move(cell, true);
        this.rotate(orientation, true);
        this.__draw__(cell, orientation);

        this._drawed = true;

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
     */
    setState(state) {
        for (let state_param in this._state) {
            if (state_param in state) {
                this._state[state_param] = state[state_param];
            }
        }

        if (this._state.highlighted === true) {
            this._bezel.attr('filter', 'url(#glow-plate)');
        } else {
            this._bezel.attr('filter', null);
        }
    }

    /**
     * Выделить ошибку
     *
     * @param on
     */
    highlightError(on=false) {
        if (on) {
            // возможно, к плашке применён фильтр
            this._bezel.attr('filter', null);
            // установить подсветку ошибки
            this._error_highlighter.opacity(0.3);
        } else {
            // снять подсветку ошибки
            this._error_highlighter.opacity(0);
            // возможно, плашке нужно вернуть фильтр
            if (this._state.highlighted === true) {
                this._bezel.attr('filter', 'url(#glow-plate)');
            }
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

        let orx = this._params.origin.x,
            ory = this._params.origin.y;

        // let cell_norm = this._getCellNormal(cell);
        let pos = this._getPositionAdjusted(cell);

        this._shadow.x(pos.x - orx * (cell.size.x + this.__grid.gap.x * 2));
        this._shadow.y(pos.y - ory * (cell.size.y + this.__grid.gap.y * 2));

        if (animate) {
            this._container.animate('100ms', '<>').move(
                pos.x - orx * (cell.size.x + this.__grid.gap.x * 2),
                pos.y - ory * (cell.size.y + this.__grid.gap.y * 2)
            );
        } else {
            this._container.move(
                pos.x - orx * (cell.size.x + this.__grid.gap.x * 2),
                pos.y - ory * (cell.size.y + this.__grid.gap.y * 2)
            );
        }

        if (!suppress_events) {
            this._afterReposition();

            this._callbacks.change({
                id: this._id,
                action: 'move'
            })
        }
    }

    /**
     * Сместить плашку на (dx, dy) позиций по осям X и Y соответственно
     *
     * @param {int} dx смещение по оси X
     * @param {int} dy смещение по оси Y
     */
    shift(dx, dy, prevent_overflow=true) {
        let px = this._state.cell.idx.x,
            py = this._state.cell.idx.y;

        let Nx = this.__grid.dim.x,
            Ny = this.__grid.dim.y;

        if (px + dx < 0 || px + dx >= Nx || py + dy < 0 || py + dy >= Ny) {
            return;
        }

        this.move(this.__grid.cell(this._state.cell.idx.x + dx, this._state.cell.idx.y + dy));

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

        let cell_supposed = undefined;

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
        if (!cb) {this._callbacks.change = () => {}}

        this._callbacks.change = cb;
    }

    /**
     * Установить обработчик события вращения колёсика мыши на плашке
     *
     * @param {function} cb обработчик события вращения колёсика мыши на плашке
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

        this._ctxmenu.draw(cursor_point, true, [this._state.adc]);
    }

    /**
     * Скрыть контекстное меню плашки
     */
    hideContextMenu() {
        this._ctxmenu.dispose();

        // if (!this._ctx_menu_active) return;
        //
        // this._ctx_menu_group.clear();
        // this._ctx_menu_group.opacity(0);
        //
        // this._ctx_menu_active = false;
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
     * Отобразить тень на предполагаемой ближайшей ячейке
     *
     * @private
     */
    _dropShadowToCell(cell) {
        let sx = this._params.size.x,
            sy = this._params.size.y;

        let orx = this._params.origin.x,
            ory = this._params.origin.y;

        let pos = this._getPositionAdjusted(cell);

        this._shadow.x(pos.x - orx * (cell.size.x + this.__grid.gap.x * 2));
        this._shadow.y(pos.y - ory * (cell.size.y + this.__grid.gap.y * 2));
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
        let sx = this._params.size.x,
            sy = this._params.size.y;

        let orx = this._params.origin.x,
            ory = this._params.origin.y;

        /// Реальные координаты плашки
        let gx = this._group.x(),
            gy = this._group.y();

        let cx = this._container.x(),
            cy = this._container.y();

        let spx = this._params.size_px.x,
            spy = this._params.size_px.y;

        let x = 0,
            y = 0;

        // Учесть влияние вращения на систему координат
        switch (this._state.orientation) {
            case Plate.Orientations.East:   {x = cx;                y = cy;             break;}
            case Plate.Orientations.North:  {x = cx + gx - spy;     y = cy + gy;        break;}
            case Plate.Orientations.West:   {x = cx + gx - spx;     y = cy + gy - spy;  break;}
            case Plate.Orientations.South:  {x = cx + gx;           y = cy + gy - spx;  break;}
        }

        /// Количество ячеек
        let Nx = 0,
            Ny = 0;

        Nx = this.__grid.dim.x - (sx - orx);
        Ny = this.__grid.dim.y - (sy - ory);

        /// Нуль (мин. допустимый номер ячейки, куда может встать плашка)
        let Ox = 0,
            Oy = 0;

        let cell = this.__grid.getCellByPos(x, y, Grid.BorderTypes.Replicate);
        let cell_orig = this._getCellOriginal(cell);

        let ix = cell_orig.idx.x,
            iy = cell_orig.idx.y;

        console.log(ix, iy);

        // console.log(`x: ${Ox} < ${cell.idx.x} < ${Nx}`, `y: ${Oy} < ${cell.idx.y} < ${Ny}`);

        let px = cell_orig.pos.x,// + cell_orig.size.x / 2,
            py = cell_orig.pos.y;// + cell_orig.size.y / 2;

        /// Проверка на выход за границы сетки ячеек
        if (ix >= Nx)   {ix = Nx}
        if (ix <= Ox)   {ix = Ox}

        if (iy >= Ny)   {iy = Ny}
        if (iy <= Oy)   {iy = Oy}

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

        /// Расстояния от точки до ближайшего соседа
        // let ndx = Math.abs(px - nearest.pos.x);
        // let ndy = Math.abs(py - nearest.pos.y);
        //
        // for (let neighbor of neighbors) {
        //     /// Расстояния от точки до соседа
        //     let dx = Math.abs(px - neighbor.pos.x);
        //     let dy = Math.abs(py - neighbor.pos.y);
        //
        //     if (dx < ndx || dy < ndy) {
        //         // если хотя бы по одному измерению расстояние меньше,
        //         // взять нового ближайшего соседа
        //         nearest = neighbor;
        //         ndx = Math.abs(px - nearest.pos.x);
        //         ndy = Math.abs(py - nearest.pos.y);
        //     }
        // }

        // console.log(nearest.idx);

        return nearest;
    }

    _getCellNormal(cell) {
        let ix = cell.idx.x,
            iy = cell.idx.y;

        let orx = this._params.origin.x,
            ory = this._params.origin.y;

        return this.__grid.cell(ix - orx, iy - ory);
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

        let orx = this._params.origin.x,
            ory = this._params.origin.y;

        /// Количество ячеек, занимаемое плашкой
        let sx = this._params.size.x,
            sy = this._params.size.y;

        let dix = 0,
            diy = 0;

        switch (this._state.orientation) {
            case Plate.Orientations.East:   {dix = orx;             diy = ory;              break;}
            case Plate.Orientations.North:  {dix = sy - ory - 1;    diy = orx;              break;}
            case Plate.Orientations.West:   {dix = sx - orx - 1;    diy = sy - ory - 1;     break;}
            case Plate.Orientations.South:  {dix = ory;             diy = sx - orx - 1;     break;}
        }

        return this.__grid.cell(ix + dix, iy + diy, Grid.BorderTypes.Replicate);
    }

    _getCellOriginal2(cell) {
        let ix = cell.idx.x,
            iy = cell.idx.y;

        let orx = this._params.origin.x,
            ory = this._params.origin.y;

        /// Количество ячеек, занимаемое плашкой
        let sx = this._params.size.x,
            sy = this._params.size.y;

        let dix = 0,
            diy = 0;

        switch (this._state.orientation) {
            case Plate.Orientations.East:   {dix = orx;             diy = ory;              break;}
            case Plate.Orientations.North:  {dix = sy - ory - 1;    diy = orx;              break;}
            case Plate.Orientations.West:   {dix = orx - 1;         diy = sy - ory - 1;     break;}
            case Plate.Orientations.South:  {dix = ory;             diy = ory;              break;}
        }

        return this.__grid.cell(ix - dix, iy - diy, Grid.BorderTypes.Replicate);
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

        /// Количество ячеек, занимаемое плашкой
        let sx = this._params.size.x,
            sy = this._params.size.y;

        let orx = this._params.origin.x,
            ory = this._params.origin.y;

        /// Количество ячеек
        let Nx = this.__grid.dim.x,
            Ny = this.__grid.dim.y;

        let dx = 0,
            dy = 0;

        switch(this._state.orientation) {
            case Plate.Orientations.East:
                if (ix + sx > Nx) {dx = Nx - (ix + sx)}
                break;
            case Plate.Orientations.North:
                if (iy + sx > Ny) {dy = Ny - (iy + sx)}
                break;
            case Plate.Orientations.West:
                if (ix - sx < -1) {dx = sx - ix - 1}
                break;
            case Plate.Orientations.South:
                if (iy - sx < -1) {dy = sx - iy - 1}
                break;
        }

        ix += dx;
        iy += dy;

        // анимировать, но только не в случае незавершённой отрисовки
        this.move(this.__grid.cell(ix, iy), false, this._drawed);
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
                cell.reoccupy(adj_cur);
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

        let abs = {x: cell.pos.x, y: cell.pos.y};

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
        // TODO: Verify origin

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