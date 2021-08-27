import SVG from 'svg.js'

import Plate, { PlateProps, PlateState } from "../core/Plate";
import SwitchPlateContextMenu from "../menus/plate/SwitchPlateContextMenu";
import LinearPlate from "../core/plate/LinearPlate";
import Grid from '../core/Grid';
import Cell from '../core/Cell';

export default class ButtonPlate extends LinearPlate {
    static get Alias() {return "button"}

    private _rect1: SVG.Rect;
    private _rect2: SVG.Rect;
    private _jumper: SVG.Line;
    private _svginp: any;
    private _svginpbg: SVG.Rect;

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, schematic, verbose, id, props);

        this.state.input = true;
    }

    get __ctxmenu__() {
        return SwitchPlateContextMenu;
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position: Cell, orientation: string) {
        this._drawPicture();

        if (this._params.verbose) {
            this._redrawInput(this._state.input);
        }

        // this._group.text(`Button`).font({size: 20});
    };

    handleKeyPress(key_code: string, keydown: boolean) {
        super.handleKeyPress(key_code, keydown);

        if (key_code === "KeyQ" && keydown) {
            this.setState({input: false});
        }

        if (key_code === "KeyQ" && !keydown) {
            this.setState({input: true});
        }
    }

    /**
     * Установить состояние перемычки
     *
     * @param {object} state    новое состояние перемычки
     * @param suppress_events   глушить вызов событий
     */
    setState(state: Partial<PlateState>, suppress_events: boolean = false) {
        if (state.input === undefined) return;

        state = {input: !!Number(state.input)};

        super.setState(state, suppress_events);

        this._toggleJumper();

        if (this._params.verbose) {
            this._redrawInput(state.input);
        }
    }

    inputIncrement() {
        this.setState({input: !this.input});
    }

    inputDecrement() {
        this.inputIncrement();
    }

    _toggleJumper() {
        let line_len = this._rect2.x() - this._rect1.x();
        let line_gap = line_len / 6;

        if (this.state.input) {
            this._jumper.rotate(-25, this._rect1.cx() + line_len / 2 - line_gap, this._rect1.cy());
        } else {
            this._jumper.rotate(0, this._rect1.cx() + line_len / 2 - line_gap, this._rect1.cy());
        }
    }

    _redrawInput(input_value: number|string) {
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

        this._rect1 = this._group.rect(qs, qs);
        this._rect2 = this._group.rect(qs, qs);

        this._rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        this._rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        let line_len = this._rect2.x() - this._rect1.x();
        let line_gap = line_len / 6;

        this._group.path([
            ['M', 0, 0],
            ['l', line_len/2 - line_gap, 0],
            ['m', line_gap*2, 0],
            ['l', line_len/2 - line_gap, 0],
        ])
            .stroke({width: 3})
            .fill('none')
            .move(this._rect1.cx(), this._rect1.cy());

        this._jumper = this._group.line(
            0, 0,
            line_gap*2, 0
        )
            .stroke({width: 2, color: "#000"})
            .move(this._rect1.cx() + line_len/2 - line_gap, this._rect1.cy());

        this._group.circle(this._rect1.width() / 3).center(this._rect1.cx() + line_len/2 - line_gap, this._rect1.cy());
        this._group.circle(this._rect1.width() / 3).center(this._rect1.cx() + line_len/2 + line_gap, this._rect1.cy());

        this._toggleJumper();
    }
}