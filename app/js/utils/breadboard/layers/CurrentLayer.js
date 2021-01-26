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

        this._shorted = false;

        this._callbacks = {
            shortcircuit: () => {},
            shortcircuitstart: () => {},
            shortcircuitend: () => {},
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

    onShortCircuitStart(cb) {
        if (!cb) {this._callbacks.shortcircuitstart = () => {}}

        this._callbacks.shortcircuitstart = cb;
    }

    onShortCircuitEnd(cb) {
        if (!cb) {this._callbacks.shortcircuitend = () => {}}

        this._callbacks.shortcircuitend = cb;
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

    doesIntersectionExist(thread_1, thread_2) {
        const is_horz_1 = thread_1.from.y === thread_1.to.y;
        const is_horz_2 = thread_2.from.y === thread_2.to.y;

        if (is_horz_1 !== is_horz_2) {
            throw new Error('Orientations of given threads is different');
        }

        const [axis_main, axis_side] = is_horz_1 ? ['x', 'y'] : ['y', 'x'];

        if (thread_1.from[axis_side] !== thread_2.from[axis_side]) {
            return false;
        }

        let [c0, c1] = [
            thread_1.from[axis_main], thread_1.to[axis_main],
        ];

        let [p0, p1] = [
            thread_2.from[axis_main], thread_2.to[axis_main],
        ];

        return !((p0 <= c0 && p1 <= c0) || (p0 >= c1 && p1 >= c1));
    }

    belongsToGroup(group, thread) {
        const g_pairs = group.pairs;
        const g_is_horz = group.is_horz;

        const is_horz = thread.from.y === thread.to.y;

        if (g_is_horz !== is_horz) return false;

        for (const {points: [p_from, p_to]} of g_pairs) {
            const [axis_main, axis_side] = g_is_horz ? ['y', 'x'] : ['x', 'y'];

            const g_thread = {
                from: {[axis_main]: group.main_axis_point, [axis_side]: p_from},
                to: {[axis_main]: group.main_axis_point, [axis_side]: p_to},
            }

            if (this.doesIntersectionExist(thread, g_thread)) {
                return true;
            }
        }

        return false;
    }

    createGroup(thread) {
        const is_horz = thread.from.y === thread.to.y,
              points = is_horz ? [thread.from.x, thread.to.x] : [thread.from.y, thread.to.y],
              dir = points[1] - points[0];

        return {
            pairs: [{
                points: dir > 0 ? [points[0], points[1]] : [points[1], points[0]],
                weight: dir > 0 ? thread.weight : -thread.weight
            }],
            main_axis_point: is_horz ? thread.from.y : thread.from.x,
            is_horz
        }
    }

    addToGroup(group, thread) {
        const points = group.is_horz ? [thread.from.x, thread.to.x] : [thread.from.y, thread.to.y];
        const dir = points[1] - points[0];

        group.pairs.push({
            points: dir > 0 ? [points[0], points[1]] : [points[1], points[0]],
            weight: dir > 0 ? thread.weight : -thread.weight
        });
    }

    preprocessThreads(threads) {
        const groups = [];
        const threads_divided = [];

        // Divide threads to groups
        // Each group consists of adjacent threads of same orientation
        for (const thread of threads) {
            let added = false;

            for (const group of groups) {
                // Each thread must be added only for one specific group
                if (this.belongsToGroup(group, thread)) {
                    this.addToGroup(group, thread);
                    added = true;
                    break;
                }
            }

            // If there are no groups found for the thread,
            // init a new one and add the thread at one time
            if (!added) {
                groups.push(this.createGroup(thread));
            }
        }


        // Split threads in each group, considering that each intersection
        // creates new thread, which weight is sum of adjacent threads' weights
        for (const group of groups) {
            // List of all threads' points, projected onto a common axis
            let axis = new Set();

            // Add all pairs' unique values to a single set

            group.pairs.forEach(pair => pair.points.forEach(axis.add, axis));

            axis = Array.from(axis).sort((a, b) => a - b);

            for (let i = 0; i < axis.length - 1; i++) {
                const [a_from, a_to] = axis.slice(i, i+2);

                // Main axis is the static axis (for horizontal currents it's 'y')
                // Side axis is the dynamic one (for which the points was projected in the 'axis' set)
                const [axis_main, axis_side] = group.is_horz ? ['y', 'x'] : ['x', 'y'];

                const thread = {
                    from: {[axis_main]: group.main_axis_point, [axis_side]: a_from},
                    to: {[axis_main]: group.main_axis_point, [axis_side]: a_to},
                    weight: 0
                }

                threads_divided.push(thread);

                for (const {points: [p_from, p_to], weight} of group.pairs) {
                    const g_thread = {
                        from: {[axis_main]: group.main_axis_point, [axis_side]: p_from},
                        to: {[axis_main]: group.main_axis_point, [axis_side]: p_to},
                    }

                    if (this.doesIntersectionExist(thread, g_thread)) {
                        thread.weight += Number(weight);
                    }
                }

                if (thread.weight < 0) {
                    thread.weight = -thread.weight;
                    [thread.from, thread.to] = [thread.to, thread.from];
                }
            }
        }

        return threads_divided;
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
        threads = this.preprocessThreads(threads);

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

                    if (cur) {
                        cur.___touched = true;
                    }
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

            if (this._currents[id].is_burning) {
                this._callbacks.shortcircuit();

                if (!this._shorted) {
                    this._callbacks.shortcircuitstart();
                    this._shorted = true;
                }

                return;
            }
        }

        this._shorted = false;
        this._callbacks.shortcircuitend();
    }

    /**
     * Добавить ток
     *
     * @param {Object} thread       контур тока
     * @param {boolean} spare       щадящий режим
     * @param {boolean} show_source показывать путь тока от источника напряжения
     * @returns {Current|null}
     * @private
     */
    _addCurrent(thread, spare, show_source=true) {
        if (!thread || thread.length === 0) {}

        let line_path = this._buildCurrentLinePath(thread);
        if (line_path.length === 0) return null;

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
     *
     * @returns {Array} последовательность SVG-координат
     * @private
     */
    _buildCurrentLinePath(points) {
        if (this.__grid.virtualPoint(points.from.x, points.from.y) ||
            this.__grid.virtualPoint(points.to.x, points.to.y)
        ) {
            return [];
        }

        const   aux_point_from  = this.__grid.auxPoint(points.from.x, points.from.y),
                aux_point_to    = this.__grid.auxPoint(points.to.x, points.to.y);

        const   aux_point = aux_point_to || aux_point_from,
                to_aux = !!aux_point_to;

        if (aux_point) {
            const c_arb = to_aux ? this.__grid.cell(points.from.x, points.from.y)
                                 : this.__grid.cell(points.to.x, points.to.y);

            switch (aux_point.cat) {
                case Grid.AuxPointCats.SourceV5:  return this._getLinePathSource(c_arb, aux_point, to_aux);
                case Grid.AuxPointCats.SourceV8:  return this._getLinePathSource(c_arb, aux_point, to_aux);
                case Grid.AuxPointCats.Usb1:    return this._getLinePathUsb(c_arb, aux_point, to_aux);
                case Grid.AuxPointCats.Usb3:    return this._getLinePathUsb(c_arb, aux_point, to_aux);
            }
        }

        const   c_from  = this.__grid.cell(points.from.x, points.from.y),
                c_to    = this.__grid.cell(points.to.x, points.to.y);

        return this._getLinePathArbitrary(c_from, c_to);
    };

    _getLinePathArbitrary(c_from, c_to) {
        let needs_bias = false;

        if (this.__schematic && this.__detailed) {
            needs_bias = true;
        }

        let bias_x = (needs_bias && !Cell.IsLineHorizontal(c_from, c_to)) ? BackgroundLayer.DomainSchematicBias : 0;
        let bias_y = (needs_bias &&  Cell.IsLineHorizontal(c_from, c_to)) ? BackgroundLayer.DomainSchematicBias : 0;

        if (Cell.IsLineAt(c_from, c_to, null, this.__grid.curr_straight_top_y)) {
            // cells at the "+" line

            // FIXME: Temporary solution! Do not use in final production!
            return [
                ['M', c_from.center_adj.x, c_from.center_adj.y - bias_y],
                ['L', c_to.center_adj.x, c_to.center_adj.y - bias_y],
                ['L', c_to.center_adj.x, c_to.center_adj.y]
            ]
        }

        if (Cell.IsLineAt(c_from, c_to, null, this.__grid.curr_straight_bottom_y)) {
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

    _getLinePathSource(c_arb, aux_point, to_source=false) {
        let needs_bias  = this.__schematic && this.__detailed,
            bias_y      = needs_bias * BackgroundLayer.DomainSchematicBias;

        if (to_source) {
            return [
                ['M', c_arb.center_adj.x, c_arb.center_adj.y],
                ['L', c_arb.center_adj.x, c_arb.center_adj.y + bias_y],

                ['L', aux_point.pos.x, aux_point.cell.center_adj.y + bias_y],
                ['L', aux_point.pos.x, aux_point.pos.y]
            ];
        } else {
            return [
                ['M', aux_point.pos.x, aux_point.pos.y],
                ['L', aux_point.pos.x, aux_point.cell.center_adj.y - bias_y],

                ['L', c_arb.center_adj.x, c_arb.center_adj.y - bias_y],
                ['L', c_arb.center_adj.x, c_arb.center_adj.y]
            ];
        }
    }

    _getLinePathUsb(c_arb, aux_point, to_source=false) {
        if (to_source) {
            return [
                ['M', c_arb.center_adj.x, c_arb.center_adj.y],
                ['L', aux_point.pos.x - aux_point.bias, c_arb.center_adj.y],
                ['L', aux_point.pos.x - aux_point.bias, aux_point.pos.y],
                ['L', aux_point.pos.x, aux_point.pos.y]
            ];
        } else {
            return [
                ['M', aux_point.pos.x, aux_point.pos.y],
                ['L', aux_point.pos.x - aux_point.bias, aux_point.pos.y],
                ['L', aux_point.pos.x - aux_point.bias, c_arb.center_adj.y],
                ['L', c_arb.center_adj.x, c_arb.center_adj.y]
            ];
        }
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