import SVG from "svg.js";

import Plate, { PlateProps, PlateState } from "../core/Plate";
import LinearPlate from "../core/plate/LinearPlate";
import {mod} from "~/js/utils/breadboard/core/extras/helpers";
import Grid from "../core/Grid";
import Cell from "../core/Cell";

export default class PhotoresistorPlate extends LinearPlate {
    private _svginp: any;
    private _svginpbg: SVG.Rect;
    static get Alias() {return "photoresistor"}

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, schematic, verbose, id, props);

        this._state.input = 0;
    }

    /**
     * Нарисовать фоторезистор
     *
     * @param {Cell}    position    положение фоторезистора
     * @param {string}  orientation ориентация фоторезистора
     */
    __draw__(position: Cell, orientation: string) {
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
    shift(dx: number, dy: number) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть фоторезистор
     *
     * @param {string} orientation ориентация фоторезистора
     */
    rotate(orientation: string) {
        super.rotate(orientation);
    }

    inputIncrement() {
        this.setState({input: mod(Number(this.input) + 1, 256)});
    }

    inputDecrement() {
        this.setState({input: mod(Number(this.input) - 1, 256)});
    }

    setState(state: Partial<PlateState>, suppress_events: boolean = false) {
        if (state.input === undefined) return;

        let input = state.input || 0;

        input = Math.min(Math.max(input, 0), 255);

        super.setState({input}, suppress_events);

        if (this._params.verbose) {
            this._redrawInput(input);
        }
    }

    _redrawInput(input_value: string) {
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
            .circle(qs/6)
            .center(frame.cx(), frame.cy());
    }
}