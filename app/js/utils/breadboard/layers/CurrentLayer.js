import Layer from "../core/Layer";
import Current from "../core/Current";

const CURRENT_WIDTH = 20;

export default class CurrentLayer extends Layer {
    static get Class() {return "bb-layer-current"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(CurrentLayer.Class);

        this._currents = {};

        this._cellgroup = undefined;
    }

    /**
     * Организовать структуру SVG-слоя
     */
    compose() {
        this._cellgroup = this._container.group();
        // this._cellgroup.move(100, 170);
    }

    /**
     * Возвратить все токи
     *
     * @returns {{}} множество текущих токов
     */
    getAllCurrents() {
        return this._currents;
    }

    /**
     * Удалить ток
     *
     * @param {String|Number} id идентификатор тока
     */
    removeCurrent(id) {
        if (typeof id === "undefined") {
            throw new TypeError("Argument 'id' must be defined");
        }

        if (!(id in this._currents)) {
            throw new TypeError(`Current ${id} does not exist`);
        }

        let current = this._currents[id];

        current.erase();

        delete this._currents[current.id];
    }

    /**
     * Удалить все токи
     */
    removeAllCurrents() {
        for (let current_id in this._currents) {
            this.removeCurrent(current_id);
        }
    };

    /**
     * Активировать все токи
     */
    activateAllCurrents() {
        for (let current of this._currents) {
            current.activate();
        }
    };

    /**
     * Деактивировать все токи
     */
    deactivateAllCurrents () {
        for (let current of this._currents) {
            current.deactivate();
        }
    }

    /**
     * Отобразить токи на плате
     *
     * Создание новых, сохранение текущих и удаление несуществующих токов
     * производится автоматически
     *
     * @param {Array<Object>}   threads     список контуров токов, которые должны отображаться на слое
     * @param {boolean}         spare       щадящий режим (для слабых машин)
     */
    setCurrents(threads, spare) {
        /// снять возможную пометку с локальных токов
        for (let current_id in this._currents) {
            this._currents[current_id].___touched = undefined;
        }

        /// выполнить основной цикл
        for (let current_id in this._currents) {
            /// извлечь ток
            let current = this._currents[current_id];

            /// здесь будет храниться обнаруженный идентичный контур
            let same = false;

            /// цикл по новым контурам
            for (let thread of threads) {
                /// если у данного локального тока контур совпадает
                if (current.hasSameThread(thread)) {
                    /// записать контур
                    same = thread;
                    /// установить метки
                    thread.___touched = true;
                    current.___touched = true;

                    break;
                }
            }

            if (same) {
                current.setWeight(same.weight);
            }
        }

        /// удалить непомеченные токи
        for (let current_id in this._currents) {
            if (!this._currents[current_id].___touched) {
                this.removeCurrent(current_id)
            }
        }

        /// создать токи для непомеченных контуров
        for (let thread of threads) {
            if (!thread.___touched) {
                let cur = this._addCurrent(thread, spare);
                cur.___touched = true;
            }
        }
    }

    /**
     * Добавить ток
     *
     * @param {Object} thread контур тока
     * @param {boolean} spare щадящий режим
     * @returns {Current}
     * @private
     */
    _addCurrent(thread, spare) {
        if (!thread || thread.length === 0) {}

        let current = new Current(this._cellgroup, thread, {
            width: CURRENT_WIDTH,
            linecap: "round"
        });

        let line_data = this._buildCurrentLine(thread);

        this._currents[current.id] = current;

        let weight = thread.weight > 1 ? 1 : thread.weight;
        this._weight = weight;

        current.draw(line_data, weight);
        current.activate(weight);

        return current;
    };

    /**
     * Построить путь прохождения тока
     *
     * @param   {Object} points контур - объект, содержащий точки прохождения тока
     * @returns {Array} последовательность SVG-координат
     * @private
     */
    _buildCurrentLine(points) {
        let cell_from  = this.__grid.cell(points.from.x, points.from.y),
            cell_to    = this.__grid.cell(points.to.x, points.to.y);

        return {
            from: {x: cell_from.center.x, y: cell_from.center.y},
            to: {x: cell_to.center.x, y: cell_to.center.y}
        };
    };

    /**
     * Достроить путь тока SVG-координатами
     *
     * @param {Array}   path        путь, к которому добавлять координаты
     * @param {Object}  cell_from   точка истока
     * @param {Object}  cell_to     точка стока
     * @private
     * @deprecated
     */
    static _appendLinePath(path, cell_from, cell_to) {
        path.push(['M', cell_from.center.x, cell_from.center.y]);
        path.push(['L', cell_from.center.x, cell_from.center.y]);
        path.push(['L', cell_to.center.x,   cell_to.center.y]);
    };
}