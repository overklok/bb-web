import Cell from "./Cell";

let lastId = 0;

const ORIENTATIONS = {
    West:   'west',
    North:  'north',
    East:   'east',
    South:  'south'
};

/**
 * Класс плашки доски
 */
class Plate {
    static get Orientations() {return ORIENTATIONS}
    static get Class() {return "bb-plate"}
    static get Alias() {return "default"}

    constructor(container_parent, grid, id=null, extra) {
        if (!container_parent || !grid) {
            throw new TypeError("Both of container and grid arguments should be specified");
        }

        this._alias = this.constructor.Alias;

        /// Идентификатор - по умолчанию, отрицательное число
        this._id = (id === null) ? (--lastId) : (id);

        /// Контейнер, группа и ссылка на сетку
        this._container = container_parent.nested();        // для масштабирования
        this._group     = this._container.group();          // для поворота
        this._bezel     = this._group.rect("100%", "100%"); // для окантовки
        this.__grid     = grid;

        /// Размер плашки и её опорная точка
        this._size      = {x: 0, y: 0};
        this._origin    = {x: 0, y: 0};

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

        this._editable = false;
        this._dragging = false;
    }

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

    get container() {
        return this._container;
    }

    /**
     * Нарисовать плашку
     *
     * @param {Cell}    cell        положение элемента относительно опорной точки
     * @param {string}  orientation ориентация элемента относительно опорной точки
     *
     * @abstract
     */
    draw(cell, orientation) {
        let width   = (cell.size.x * this._size.x) + (this.__grid.gap.x * 2 * (this._size.x - 1));
        let height  = (cell.size.y * this._size.y) + (this.__grid.gap.y * 2 * (this._size.y - 1));

        this._container.size(width, height);

        this._bezel.fill({color: "#ff0"});

        this.move(cell);
        this.rotate(orientation);
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
            this._group.attr('filter', 'url(#glow)');
        } else {
            this._group.attr('filter', null);
        }
    }

    /**
     * Переместить плашку в новую клетку
     *
     * @param {Cell} cell положение плашки относительно опорной точки
     */
    move(cell) {
        /// TODO check position validity
        this._params.cell = cell;

        this._container.x(this.cell.pos.x);
        this._container.y(this.cell.pos.y);
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
     */
    rotate(orientation) {
        /// TODO check orientation validity
        let angle = Plate._orientationToAngle(orientation);

        this._group.transform({rotation: angle, cx: this.cell.size.x / 2, cy: this.cell.size.y / 2});

        this._params.orientation = orientation;
    }

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

    select() {
        this._bezel.stroke({color: "#0900fa", width: 2});
    }

    deselect() {
        this._bezel.stroke({width: 0});
    }

    /**
     * Удалить плашку
     */
    dispose() {
        this._container.node.remove();
    }

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

        let svg_point = svg_main.createSVGPoint();

        this._container.style({cursor: 'move'});

        let cursor_point_last = undefined;

        let onmove = (evt) => {
            let cursor_point = Plate._getCursorPoint(svg_main, svg_point, evt);

            let dx = cursor_point.x - cursor_point_last.x;
            let dy = cursor_point.y - cursor_point_last.y;

            this._container.dmove(dx, dy);

            cursor_point_last = cursor_point;

            this._dragging = true;
        };

        this._group.mousedown((evt) => {
            document.body.addEventListener('mousemove', onmove, false);
            cursor_point_last = Plate._getCursorPoint(svg_main, svg_point, evt);
        });

        this._group.mouseup((evt) => {
            document.body.removeEventListener('mousemove', onmove, false);

            if (!this._dragging) {
                this.rotateClockwise();
            }

            this._dragging = false;

            this._snapToNearestCell();
        });

        this._editable = true;
        return true;
    }

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

export default Plate;