import Layer from "../core/Layer";
import Current from "../core/Current";

const CURRENT_WIDTH = 20;
const CURRENT_ANIM_SPEED     = 600;            // Скорость анимации стрелок, arrows/sec

export default class CurrentLayer extends Layer {
    static get Class() {return "bb-layer-current"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(CurrentLayer.Class);

        this._currents = {};

        this._cellgroup = undefined;
    }

    compose() {
        this._cellgroup = this._container.group();
        this._cellgroup.move(100, 170);
    }

    getAllCurrents() {
        return this._currents;
    }

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

    removeAllCurrents() {
        for (let current_id in this._currents) {
            this.removeCurrent(current_id);
        }
    };

    activateAllCurrents() {
        for (let current of this._currents) {
            current.activate();
        }
    };

    deactivateAllCurrents () {
        for (let current of this._currents) {
            current.deactivate();
        }
    }

    setCurrents(threads) {
        for (let current_id in this._currents) {
            this._currents[current_id].touched = undefined;
        }

        for (let current_id in this._currents) {
            let current = this._currents[current_id];

            let same = false;

            for (let thread of threads) {
                if (current.hasSameThread(thread)) {
                    same = thread;
                    thread.touched = true;
                    current.touched = true;

                    break;
                }
            }

            if (same) {
                current.setWeight(same.weight);
            }
        }

        for (let thread of threads) {
            if (!thread.touched) {
                let cur = this._addCurrent(thread);
                cur.touched = true;
            }
        }

        for (let current_id in this._currents) {
            if (!this._currents[current_id].touched) {
                this.removeCurrent(current_id)
            }
        }
    }

    _addCurrent(thread) {
        if (!thread || thread.length === 0) {}

        let current = new Current(this._cellgroup, thread, {
            width: CURRENT_WIDTH,
            linecap: "round"
        });

        let path_data = this._buildCurrentPath(thread);

        this._currents[current.id] = current;

        current.draw(path_data, thread.weight);
        current.activate(CURRENT_ANIM_SPEED);

        return current;
    };

    _findCurrentByPoints(points) {
        for (let current of this._currents) {
            // console.log(thread.from.x, thread.from.y,
            //             thread.to.x, thread.to.y,
            //             current.thread.from.x, current.thread.from.y,
            //             current.thread.to.x, current.thread.to.y,
            //     );

            if (points.from.x === current.thread.from.x &&
                points.from.y === current.thread.from.y &&
                points.to.x === current.thread.to.x &&
                points.to.y === current.thread.to.y) {
                return current;
            }
        }

        return null;
    }

    _buildCurrentPath(points) {
        let full_path = [];

        let cell_from  = this.__grid.cell(points.from.x, points.from.y);
        let cell_to    = this.__grid.cell(points.to.x, points.to.y);

        CurrentLayer._appendLinePath(full_path, cell_from, cell_to);

        return full_path;
    };

    static _appendLinePath(path, cell_from, cell_to) {
        path.push(['M', cell_from.center.x, cell_from.center.y]);
        path.push(['L', cell_from.center.x, cell_from.center.y]);
        path.push(['L', cell_to.center.x,   cell_to.center.y]);

        return true;
    };
}