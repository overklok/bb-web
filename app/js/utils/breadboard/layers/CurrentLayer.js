import Grid from "../core/Grid";
import Cell from "../core/Cell";
import Layer from "../core/Layer";
import Current from "../core/Current";
import BackgroundLayer from "../layers/BackgroundLayer";
export default class CurrentLayer extends Layer {
    static get Class() {return "bb-layer-current"}

    static get MeaningfulnessThreshold() {return 1e-8}

    constructor(container, grid, schematic=false, detailed=false) {
        super(container, grid, schematic, detailed);

        this._container.addClass(CurrentLayer.Class);

        this._currents = {};
        this._threads = {};

        this._spare = undefined;
        this._show_source = undefined;

        this._currentgroup = undefined;

        this._callbacks = {
            shortcircuit: () => {
                console.warn("A short circuit has been occurred. It seems this event won't be handled.")
            },
        }
    }

    /**
     * Организовать структуру SVG-слоя
     */
    compose() {
        this._initGroups();
    }

    recompose(schematic, detailed, show_source=true) {
        super.recompose(schematic, detailed);

        let threads = Object.assign([], this._threads);

        this.removeAllCurrents();

        this._initGroups();

        this.setCurrents(threads, this._spare, show_source);
    }

    onShortCircuit(cb) {
        if (!cb) {this._callbacks.shortcircuit = () => {}}

        this._callbacks.shortcircuit = cb;
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
    removeCurrent(id, burn=false) {
        if (typeof id === "undefined") {
            throw new TypeError("Argument 'id' must be defined");
        }

        if (!(id in this._currents)) {
            throw new TypeError(`Current ${id} does not exist`);
        }

        let current = this._currents[id];

        if (burn) {
            current.burn();
        } else {
            current.erase();
        }

        delete this._currents[current.id];
    }

    /**
     * Удалить все токи
     */
    removeAllCurrents() {
        for (let current_id in this._currents) {
            this.removeCurrent(current_id);
        }

        this._threads = {};
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
     * @param {boolean}         show_source показывать путь тока от источника напряжения
     */
    setCurrents(threads, spare, show_source=true) {
        this._threads = threads;
        this._spare = spare;
        this._show_source = show_source;

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
            for (let [i, thread] of threads.entries()) {
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
                if (same.weight < CurrentLayer.MeaningfulnessThreshold) {
                    // удалить ток, если он недостаточно весомый
                    this.removeCurrent(current_id);
                } else {
                    // обновить вес тока
                    current.setWeight(same.weight);
                }
            }
        }

        /// удалить непомеченные токи
        for (let current_id in this._currents) {
            if (!this._currents[current_id].___touched) {
                this.removeCurrent(current_id)
            }
        }

        /// создать токи для непомеченных контуров
        for (let [i, thread] of threads.entries()) {
            if (!thread.___touched) {
                if (thread.weight < CurrentLayer.MeaningfulnessThreshold) {
                    // удалить путь тока, если он недостаточно весомый
                    delete threads[i];
                } else {
                    // добавить новый ток
                    let cur = this._addCurrent(thread, spare, show_source);
                    cur.___touched = true;
                }
            }
        }

        this._findShortCircuits();
    }

    _initGroups() {
        this._clearGroups();

        this._currentgroup = this._container.group();
    }

    _clearGroups() {
        if (this._currentgroup) this._currentgroup.remove();
    }

    _findShortCircuits() {
        for (const id in this._currents) {
            if (!this._currents.hasOwnProperty(id)) continue;

            if (this._currents[id]._weight > 0.999) {
                this._callbacks.shortcircuit();

                this.removeCurrent(id, true);
            }
        }
    }

    /**
     * Добавить ток
     *
     * @param {Object} thread       контур тока
     * @param {boolean} spare       щадящий режим
     * @param {boolean} show_source показывать путь тока от источника напряжения
     * @returns {Current}
     * @private
     */
    _addCurrent(thread, spare, show_source=true) {
        if (!thread || thread.length === 0) {}

        let line_path = this._buildCurrentLinePath(thread);
        let current = new Current(this._currentgroup, thread, this.__schematic);

        this._currents[current.id] = current;

        current.draw(line_path);
        current.activate();

        return current;
    };

    /**
     * Построить пути прохождения тока
     *
     * @param   {Object}    points          контур - объект, содержащий точки прохождения тока
     * @returns {Array} последовательность SVG-координат
     * @private
     */
    _buildCurrentLinePath(points) {
        const last_coord_y = this.__grid.dim.y - 1;
        let path;

        // Ток идёт ИЗ ПЛЮСА
        if (points.from.x === -1 && points.from.y === 1) {
            let c_arb = this.__grid.cell(points.to.x, points.to.y);
            path = this._getLinePathSourcePlus(c_arb, false);
        }

        // Ток идёт ИЗ МИНУСА
        else if (points.from.x === - 1 && points.from.y === last_coord_y) {
            let c_arb = this.__grid.cell(points.to.x, points.to.y);
            path = this._getLinePathSourceMinus(c_arb, true);
        }

        // Ток идёт В ПЛЮС
        else if (points.to.x === - 1 && points.to.y === 1) {
            let c_arb = this.__grid.cell(points.from.x, points.from.y);
            path = this._getLinePathSourcePlus(c_arb, true);
        }

        // Ток идёт В МИНУС
        else if (points.to.x === - 1 && points.to.y === last_coord_y) {
            let c_arb = this.__grid.cell(points.from.x, points.from.y);
            path = this._getLinePathSourceMinus(c_arb, false);
        }

        else {
            let c_from  = this.__grid.cell(points.from.x, points.from.y),
                c_to    = this.__grid.cell(points.to.x, points.to.y)

            path = this._getLinePathArbitrary(c_from, c_to);
        }

        return path;
    };

    _getLinePathArbitrary(c_from, c_to) {
        let needs_bias = false;

        if (this.__schematic && this.__detailed) {
            needs_bias = true;
        }

        let bias_x = (needs_bias && !Cell.IsLineHorizontal(c_from, c_to)) ? BackgroundLayer.DomainSchematicBias : 0;
        let bias_y = (needs_bias &&  Cell.IsLineHorizontal(c_from, c_to)) ? BackgroundLayer.DomainSchematicBias : 0;

        if (Cell.IsLineAt(c_from, c_to, null, 1)) {
            // cells at the "+" line

            // FIXME: Temporary solution! Do not use in final production!
            return [
                ['M', c_from.center_adj.x, c_from.center_adj.y - bias_y],
                ['L', c_to.center_adj.x, c_to.center_adj.y - bias_y],
                ['L', c_to.center_adj.x, c_to.center_adj.y]
            ]
        }

        if (Cell.IsLineAt(c_from, c_to, null, -1)) {
            // cells at the "-" line

            // FIXME: Temporary solution! Do not use in final production!
            return [
                ['M', c_from.center_adj.x, c_from.center_adj.y],
                ['L', c_from.center_adj.x, c_from.center_adj.y + bias_y],
                ['L', c_to.center_adj.x, c_to.center_adj.y + bias_y],
            ]
        }

        return [
            ['M', c_from.center_adj.x, c_from.center_adj.y],
            ['L', c_from.center_adj.x + bias_x, c_from.center_adj.y + bias_y],
            ['L', c_to.center_adj.x + bias_x, c_to.center_adj.y + bias_y],
            ['L', c_to.center_adj.x, c_to.center_adj.y]
        ];
    }

    _getLinePathSourcePlus(c_arb, to_source=false) {
        // "out" (from "+") means this is top current
        let c_zero = this.__grid.cell(0, 1);

        let needs_bias = this.__schematic && this.__detailed;
        let bias_y = needs_bias ? BackgroundLayer.DomainSchematicBias : 0;

        if (to_source) {
            return [
                ['M', c_arb.center_adj.x, c_arb.center_adj.y],
                ['L', c_arb.center_adj.x, c_arb.center_adj.y - bias_y],
                ['L', c_zero.center_adj.x, c_zero.center_adj.y - bias_y],

                ['L', 80, c_zero.center_adj.y - bias_y],
                ['L', 80, 720]
            ];
        } else {
            return [
                ['M', 80, 720],
                ['L', 80, c_zero.center_adj.y - bias_y],
                ['L', c_zero.center_adj.x, c_zero.center_adj.y - bias_y],

                ['L', c_arb.center_adj.x, c_arb.center_adj.y - bias_y],
                ['L', c_arb.center_adj.x, c_arb.center_adj.y]
            ];
        }
    }

    _getLinePathSourceMinus(c_arb, to_source=false) {
        // "in" (to "-") means this is bottom current
        let c_zero = this.__grid.cell(0, -1, Grid.BorderTypes.Wrap);

        let needs_bias = this.__schematic && this.__detailed;
        let bias_y = needs_bias ? BackgroundLayer.DomainSchematicBias : 0;

        if (to_source) {
            return [
                ['M', 80, 780],
                ['L', 80, c_zero.center_adj.y + bias_y],

                ['L', c_arb.center_adj.x, c_arb.center_adj.y + bias_y],
                ['L', c_arb.center_adj.x, c_arb.center_adj.y]
            ];
        } else {
            return [
                ['M', c_arb.center_adj.x, c_arb.center_adj.y],
                ['L', c_arb.center_adj.x, c_arb.center_adj.y + bias_y],

                ['L', 80, c_zero.center_adj.y + bias_y],
                ['L', 80, 780]
            ];
        };
    }

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