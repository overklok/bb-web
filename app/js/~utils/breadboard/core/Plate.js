import Cell from "./Cell";

let lastId = 0;

/**
 * Класс плашки доски
 */
class Plate {
    constructor(container_parent, grid, id=null) {
        if (!container_parent || !grid) {
            throw new TypeError("Both of container and grid arguments should be specified");
        }

        /// Идентификатор - по умолчанию, отрицательное число
        this._id = (id === null) ? (--lastId) : (id);

        /// Контейнер, группа и ссылка на сетку
        this._container = container_parent.nested();    // для масштабирования
        this._group     = this._container.group();      // для поворота
        this.__grid     = grid;

        /// Размер плашки и её опорная точка
        this._size      = {x: 0, y: 0};
        this._origin    = {x: 0, y: 0};

        /// Параметры - постоянные свойства плашки
        this._params = {
            cell:           undefined,  // ячейка, задающая положение опорной точки
            orientation:    undefined,  // ориентация плашки
        };

        /// Состояние - изменяемые свойства плашки
        this._state = {
            highlighted: false,
        };

        this._dragging = false;

        this._connectEvents();
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

    /**
     * Возвратить текущее состояние плашки
     *
     * @returns {{}} состояние плашки
     */
    get state() {
        return this._state;
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

        this._group.rect("100%", "100%").fill({color: "#ff0"});

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
     *
     * @abstract
     */
    move(cell) {
        /// TODO check position validity
        let pos_x = cell.pos.x;
        let pos_y = cell.pos.y;

        this._group.move(pos_x, pos_y);

        this._params.cell = cell;
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
     *
     * @abstract
     */
    rotate(orientation) {
        /// TODO check orientation validity

        let angle_diff = Plate._orientationToAngle(orientation) - Plate._orientationToAngle(this._orientation);

        this._group.transform({rotation: angle_diff, cx: this.cell.size.x / 2, cy: this.cell.size.y / 2});
    }

    /**
     * Удалить плашку
     */
    dispose() {
        this._container.node.remove();
    }

    _connectEvents() {
        this._container.mousedown((evt) => {
            this._dragging = true;
            console.info("DRG TRUE");
        });

        this._container.mouseup((evt) => {
            this._dragging = false;
            console.info("DRG FALSE");
            this._container.move(evt.offsetX, evt.offsetY);
        });

        this._container.mousemove((evt) => {
            if (this._dragging) {
                console.log(evt);
            }
        });
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
            case 'west': default:   {return 0;}
            case 'north':           {return 90;}
            case 'east':            {return 180;}
            case 'south':           {return 270;}
        }
    }
}

export default Plate;