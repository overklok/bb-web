import Plate from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";

export default class PhotoresistorPlate extends LinearPlate {
    static get Alias() {return "photoresistor"}

    constructor(container, grid, schematic=false, verbose=false, id=null, props=null) {
        super(container, grid, schematic, verbose, id, props);
    }

    /**
     * Нарисовать фоторезистор
     *
     * @param {Cell}    position    положение фоторезистора
     * @param {string}  orientation ориентация фоторезистора
     */
    __draw__(position, orientation) {
        this._drawPicture();

        if (this._params.verbose) {
            this._redrawInput(this._state.input);
        }
    };

    get input() {
        return Number(this._state.input);
    }

    /**
     * Переместить фоторезистор
     *
     * @param {int} dx смещение фоторезистора по оси X
     * @param {int} dy смещение фоторезистора по оси Y
     */
    shift(dx, dy) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть фоторезистор
     *
     * @param {string} orientation ориентация фоторезистора
     */
    rotate(orientation) {
        super.rotate(orientation);
    }

    setState(state, suppress_events = false) {
        super.setState(state, suppress_events);

        if (state.input === undefined) return;

        let input = state.input;

        if (this._params.verbose) {
            this._redrawInput(input);
        }
    }

    _redrawInput(input_value) {
        if (!this._svginp) {
            this._svginpbg = this._container.rect(0, 0).style({fill: '#000'});

            this._svginp = this._container.text('-')
                .center(0, 0)
                .style({fill: '#0F0'})
                .font({size: 22});
        }

        this._svginp.style({fill: input_value === undefined ? '#F00' : '#0F0'});
        this._svginp.text(input_value === undefined ? 'n/a' : String(input_value));

        const {x, y, width, height} = this._svginp.node.getBBox();

        this._svginpbg.size(width, height).move(x, y);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizePreferred) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);

        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        let line_len = rect2.x() - rect1.x();

        this._group.polyline([
            [0, 0],
            [line_len, 0]
        ])
            .stroke({width: 1})
            .fill('none')
            .move(rect1.cx(), rect2.cy());

        let frame = this._group.rect(line_len / 2, qs*1.2)
            .stroke({width: 1})
            .fill("#fffffd")
            .radius(qs/1.5)
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy());

        this._group.path([
            ['M', 0, 0],
            ['c', 0, qs/4.2+1, -line_len / 6, 0, -line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1,  line_len / 6, 0,  line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1, -line_len / 6, 0, -line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1,  line_len / 6, 0,  line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1, -line_len / 6, 0, -line_len / 6, qs/4.2],
        ])
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(frame.cx())
            .y(frame.y());

        this._group.line(0, 0, 0, qs/1.5)
            .stroke({width: qs/6, color: "#fffffd"})
            .center(frame.cx(), frame.cy());

        this._group
            .circle(qs/6, qs/6)
            .center(frame.cx(), frame.cy());
    }
}