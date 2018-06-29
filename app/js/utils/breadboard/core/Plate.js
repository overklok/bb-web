import Cell from "./Cell";

const ORIENTATIONS = {
    West:   'west',
    North:  'north',
    East:   'east',
    South:  'south'
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
    // CSS-класс контейнера контекстного меню плашки
    static get ContextMenuClass() {return "bb-plate-ctxmenu"}
    // CSS-класс фона элемента контекстного меню плашки
    static get ContextMenuItemClass() {return "bb-plate-ctxmenu-item"}
    // CSS-класс текста элемента контекстного меню плашки
    static get ContextMenuItemTextClass() {return "bb-plate-ctxmenu-item-text"}

    // Алиасы пунктов контекстного меню
    static get CMI_REMOVE() {return "cmi_rm"}

    constructor(container_parent, grid, id=null, extra=0) {
        if (!container_parent || !grid) {
            throw new TypeError("Both of container and grid arguments should be specified");
        }

        this._alias = this.constructor.Alias;

        /// Идентификатор - по умолчанию случайная строка
        this._id = (id === null) ? (Math.floor(Math.random() * (10 ** 6))) : (id);

        /// Контейнер, группа и ссылка на сетку
        this._container = container_parent.nested();        // для масштабирования
        this._group     = this._container.group();          // для поворота
        this._bezel     = this._group.rect("100%", "100%"); // для окантовки
        this.__grid     = grid;

        this._group_editable = this._group.group();                   // для режима редактирования
        this._error_highlighter = this._group.rect("100%", "100%");   // для подсветки

        this._ctx_menu_group = this._container.group().move(0, 0); // для контекстного меню

        /// Размер плашки и её опорная точка
        this._size      = {x: 0, y: 0};
        this._origin    = {x: 0, y: 0};

        /// Физический размер плашки (в px)
        this._size_px   = {x: 0, y: 0};

        /// Параметры - постоянные свойства плашки
        this._params = {
            cell:           undefined,                  // ячейка, задающая положение опорной точки
            orientation:    Plate.Orientations.West,    // ориентация плашки
        };

        /// Дополнительный параметр
        this._extra = extra;

        /// Состояние - изменяемые свойства плашки
        this._state = {
            highlighted: false,
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
        /// Событие начала перетаскивания было инициировано
        this._dragstart_activated = false;
        /// Контекстное меню отображается
        this._ctx_menu_active = false;
        /// Высота контекстного меню
        this._ctx_menu_height = 0;

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

    /**
     * Возвратить текущую ячейку, задающую положение опорной точки плашки
     *
     * @returns {undefined|Cell} ячейка, задающая положение опорной точки плашки
     */
    get cell() {
        return this._params.cell;
    }

    /**
     * Возвратить текущую ориентацию плашки
     *
     * @returns {undefined|string} ориентация плашки
     */
    get orientation() {
        return this._params.orientation;
    }

    get extra() {
        return this._extra;
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
    draw(cell, orientation) {
        let width   = (cell.size.x * this._size.x) + (this.__grid.gap.x * 2 * (this._size.x - 1));
        let height  = (cell.size.y * this._size.y) + (this.__grid.gap.y * 2 * (this._size.y - 1));

        this._container.size(width, height);

        this._bezel.fill({color: "#fffffd"}).radius(10);
        this._bezel.stroke({color: "#fffffd", width: 2});

        this._error_highlighter.fill({color: "#f00"}).radius(10);

        this.highlightError(false);
        this.move(cell, true);
        this.__draw__(cell, orientation);
        this.rotate(orientation, true);

        this._size_px.x = width;
        this._size_px.y = height;
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
            this._error_highlighter.opacity(0.3);
        } else {
            this._error_highlighter.opacity(0);
        }
    }

    /**
     * Переместить плашку в новую клетку
     *
     * @param {Cell}    cell            положение плашки относительно опорной точки
     * @param {boolean} suppress_events подавить инициацию событий
     */
    move(cell, suppress_events=false) {
        /// TODO check position validity
        this._params.cell = cell;

        this._container.x(this.cell.pos.x);
        this._container.y(this.cell.pos.y);

        if (!suppress_events) {this._callbacks.change({
            id: this._id,
            action: 'move'
        })}
    }

    /**
     * Сместить плашку на (dx, dy) позиций по осям X и Y соответственно
     *
     * @param {int} dx смещение по оси X
     * @param {int} dy смещение по оси Y
     */
    shift(dx, dy) {
        this.move(this.__grid.cell(this.cell.idx.x + dx, this.cell.idx.y + dy));
    }

    /**
     * Повернуть плашку
     *
     * @param {string} orientation ориентация плашки относительно опорной точки
     * @param {boolean} suppress_events подавить инициацию событий
     */
    rotate(orientation, suppress_events=false) {
        /// TODO check orientation validity
        let angle = Plate._orientationToAngle(orientation);

        this._group.transform({rotation: angle, cx: this.cell.size.x / 2, cy: this.cell.size.y / 2});

        this._params.orientation = orientation;

        if (!suppress_events) {this._callbacks.change({
            id: this._id,
            action: 'rotate'
        })}
    }

    /**
     * Повернуть плашку по часовой стрелке
     */
    rotateClockwise() {
        let orientation;

        switch (this.orientation) {
            case Plate.Orientations.West: {orientation = Plate.Orientations.North; break}
            case Plate.Orientations.North: {orientation = Plate.Orientations.East; break}
            case Plate.Orientations.East: {orientation = Plate.Orientations.South; break}
            case Plate.Orientations.South: {orientation = Plate.Orientations.West; break}

            default: {throw new TypeError("Current orientation is invalid")}
        }

        this.rotate(orientation);
    }

    /**
     * Повернуть плашку по часовой стрелке
     */
    rotateCounterClockwise() {
        let orientation;

        switch (this.orientation) {
            case Plate.Orientations.West: {orientation = Plate.Orientations.South; break}
            case Plate.Orientations.South: {orientation = Plate.Orientations.East; break}
            case Plate.Orientations.East: {orientation = Plate.Orientations.North; break}
            case Plate.Orientations.North: {orientation = Plate.Orientations.West; break}

            default: {throw new TypeError("Current orientation is invalid")}
        }

        this.rotate(orientation);
    }

    /**
     * Выделить контур плашки
     */
    select() {
        this._bezel.stroke({color: "#0900fa", width: 2});
        this.highlightError(false);
    }

    /**
     * Снять выделение контура плашки
     */
    deselect() {
        this._bezel.stroke({width: 0});
    }

    /**
     * Удалить плашку
     */
    dispose() {
        this._container.node.remove();
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

        let svg_point = svg_main.createSVGPoint();

        let cursor_point_last = undefined;

        /// обработчик перетаскивания плашки
        let onmove = (evt) => {
            let cursor_point = Plate._getCursorPoint(svg_main, svg_point, evt);

            let dx = cursor_point.x - cursor_point_last.x;
            let dy = cursor_point.y - cursor_point_last.y;

            this._container.dmove(dx, dy);

            cursor_point_last = cursor_point;

            if (dx > 0 || dy > 0) {
                this._dragging = true;

                if (!this._dragstart_activated) {
                    this._callbacks.dragstart();
                    this._dragstart_activated = true;
                }
            }
        };

        /// обработчик нажатия кнопки мыши на плашке
        this._group.mousedown((evt) => {
            if (evt.which === 1 && !this._dragging) {
                document.body.addEventListener('mousemove', onmove, false);
                cursor_point_last = Plate._getCursorPoint(svg_main, svg_point, evt);
            }
        });

        /// обработчик отпускания кнопки мыши на плашке
        this._group.mouseup((evt) => {
            if (evt.which === 1) {
                document.body.removeEventListener('mousemove', onmove, false);

                this._snapToNearestCell();

                this._dragging = false;
                this._dragstart_activated = false;
                this._callbacks.dragfinish();
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
     * @param {function} cb обработчик нажатия на пункт контекстного меню плашки
     */
    onContextMenuItemClick(cb) {
        if (!cb) {this._callbacks.ctxmenuitemclick = () => {}}

        this._callbacks.ctxmenuitemclick = cb;
    }

    /**
     * Отобразить контекстное меню плашки
     *
     * TODO: позиционирование
     *
     * @param {MouseEvent}  evt         событие нажатия мыши
     * @param {HTMLElement}     svg_main    родительский SVG-узел
     */
    showContextMenu(evt, svg_main) {
        if (this._dragging) return;

        if (this._ctx_menu_active) {
            this.hideContextMenu();
        }

        let menu_width = 200, menu_height = 50;

        // let x_offset = (this._params.cell.size.x * 2) + this.__grid.gap.x;
        // let y_offset = this._params.cell.size.y + this.__grid.gap.y;

        let nested = this._ctx_menu_group.nested();

        nested.addClass(Plate.ContextMenuClass);

        if (evt && svg_main) {
            let svg_point = svg_main.createSVGPoint();
            let cursor_point = Plate._getCursorPoint(svg_main, svg_point, evt);

            nested.move(
                cursor_point.x,// - this._size_px.x + x_offset,
                cursor_point.y// - this._size_px.y - y_offset
            );
        }

        this._ctx_menu_height = 0;
        this.appendContextMenuItem(nested, menu_width, menu_height, "Item 1", Plate.CMI_REMOVE);
        this.appendContextMenuItem(nested, menu_width, menu_height, "Item 2", undefined);

        nested.addClass('fade-in');

        this._ctx_menu_group.opacity(1);
        this._ctx_menu_active = true;
    }

    /**
     * Добавить пункт к контекстному меню плашки
     *
     * @param {SVG.Group}   container   контейнер контекстного меню
     * @param {number}      width       ширина контекстного меню
     * @param {number}      height      высота пункта
     * @param {string}      name        текст пункта
     * @param {string}      alias       алиас пункта
     */
    appendContextMenuItem(container, width, height, name, alias) {
        let rect = container.rect(width, height)
                .fill("#e7e4ff")
                .x(-10)
                .y(this._ctx_menu_height);

        let text = container.text(name).y(this._ctx_menu_height).font({size: 24});

        rect.addClass(Plate.ContextMenuItemClass);
        text.addClass(Plate.ContextMenuItemTextClass);

        rect.mousedown(() => {
            setTimeout(() => {
                this._callbacks.ctxmenuitemclick(alias);
                this.hideContextMenu();
            }, 100);
        });

        this._ctx_menu_height += height;
    }

    /**
     * Скрыть контекстное меню плашки
     */
    hideContextMenu() {
        if (!this._ctx_menu_active) return;

        this._ctx_menu_group.clear();
        this._ctx_menu_group.opacity(0);

        this._ctx_menu_active = false;
    }

    /**
     * "Заморозить" плашку
     *
     * Плашка не реагирует на события мыши и становится полупрозрачной.
     * Необходимо для предотвращения конфликтов при перетаскивании
     */
    freeze() {
        this._container.style('pointer-events', 'none');
        this._container.opacity(0.5);
    }

    /**
     * "Разморозить" плашку
     *
     * {@link Plate.freeze}
     */
    unfreeze() {
        this._container.style('pointer-events', 'inherit');
        this._container.opacity(1);
    }

    /**
     * Прикрепить плашку к ближайшей ячейке
     *
     * TODO: сделать проверку со всех сторон
     *
     * @private
     */
    _snapToNearestCell() {
        let x = this._container.x();
        let y = this._container.y();

        for (let col of this.__grid.cells) {
            let cell0 = col[0];

            if (cell0.pos.x >= x) {
                for (let cell of col) {
                    if (cell.pos.y >= y) {
                        this.move(cell); return;
                    }
                }
            }
        }
    }

    /**
     * Получить положение курсора в системе координат SVG
     *
     * @param {HTMLElement} svg_main    SVG-узел, в системе координат которого нужна точка
     * @param {MouseEvent}  evt         событие действия мышки
     *
     * @returns {SVGPoint}  точка, координаты которой определяют положение курсора
     *                      в системе координат заданного SVG-узла
     * @private
     */
    static _getCursorPoint(svg_main, svg_point, evt) {
        svg_point.x = evt.clientX;
        svg_point.y = evt.clientY;

        return svg_point.matrixTransform(svg_main.getScreenCTM().inverse());
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
            case Plate.Orientations.West:            {return 0}
            case Plate.Orientations.North:           {return 90}
            case Plate.Orientations.East:            {return 180}
            case Plate.Orientations.South:           {return 270}
            default: {throw new TypeError(`Invalid 'orientation' argument: ${orientation}`)}
        }
    }
}