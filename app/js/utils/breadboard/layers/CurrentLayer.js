import Layer from "../core/Layer";
import Current from "../core/Current";

const CURRENT_WIDTH = 20;
const CURRENT_COLOR_GOOD = "#26d0ff";
const CURRENT_COLOR_BAD = "#ff0003";

const CURRENT_ARROW_COLOR   = '#00f';       // Цвет стрелок тока
const CURRENT_ANIM_SPEED     = 300;            // Скорость анимации стрелок, arrows/sec

export default class CurrentLayer extends Layer {
    static get Class() {return "bb-layer-current"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(CurrentLayer.Class);

        this._currents = [];
        this._point_arr = [];

        this._cellgroup = undefined;
    }

    compose() {
        this._cellgroup = this._container.group();
        this._cellgroup.move(100, 170);
    }

    getAllCurrentData() {
        return this._point_arr;
    }

    removeAllCurrents() {
        for (let current of this._currents) {
            current.erase();
        }

        this._currents = [];
        this._point_arr = [];
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

    addCurrent(points, c_color=CURRENT_COLOR_GOOD) {
        if (!points || points.length === 0) {}

        let path_data = this._buildCurrentPath(points);

        let current = new Current(this._cellgroup, {
            color: c_color,
            width: CURRENT_WIDTH,
            linecap: "round"
        });

        this._currents.push(current);

        current.draw(path_data);
        current.activate(CURRENT_ANIM_SPEED, CURRENT_ARROW_COLOR);

        this._point_arr.push(points);
    };

    _buildCurrentPath(points) {
        let full_path = [];

        // Для каждой пары точек
        for (let point of points) {
            let cell_from  = this.__grid.cell(point.from.x, point.from.y);
            let cell_to    = this.__grid.cell(point.to.x, point.to.y);

            CurrentLayer._appendLinePath(full_path, cell_from, cell_to);
        }

        return full_path;
    };


    static _appendLinePath(path, cell_from, cell_to) {
        path.push(['M', cell_from.center.x, cell_from.center.y]);
        path.push(['L', cell_from.center.x, cell_from.center.y]);
        path.push(['L', cell_to.center.x,   cell_to.center.y]);

        return true;
    };
}