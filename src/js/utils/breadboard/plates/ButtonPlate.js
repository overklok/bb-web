import Plate from "../core/Plate";
import SwitchPlateContextMenu from "../menus/plate/SwitchPlateContextMenu";
import LinearPlate from "../core/plate/LinearPlate";

export default class ButtonPlate extends LinearPlate {
    static get Alias() {return "button"}

    constructor(container, grid, schematic=false, verbose=false, id=null, props=null) {
        super(container, grid, schematic, verbose, id, props);

        this.state.input = true;
    }

    __cm_class__() {
        return SwitchPlateContextMenu;
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        if (this._params.verbose) {
            this._redrawInput(this._state.input);
        }

        // this._group.text(`Button`).font({size: 20});
    };

    handleKeyPress(key_code, keydown) {
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
    setState(state, suppress_events) {
        if (state.input === undefined) return;

        state = {input: !!state.input};

        super.setState(state, suppress_events);

        this._rotateJumper();

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

    _rotateJumper() {
        let line_len = this.rect2.x() - this.rect1.x();
        let line_gap = line_len / 6;

        if (this.state.input) {
            this.jumper.rotate(-25, this.rect1.cx() + line_len / 2 - line_gap, this.rect1.cy());
        } else {
            this.jumper.rotate(0, this.rect1.cx() + line_len / 2 - line_gap, this.rect1.cy());
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

        this.rect1 = this._group.rect(qs, qs);
        this.rect2 = this._group.rect(qs, qs);

        this.rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        this.rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        let line_len = this.rect2.x() - this.rect1.x();
        let line_gap = line_len / 6;

        this._group.path([
            ['M', 0, 0],
            ['l', line_len/2 - line_gap, 0],
            ['m', line_gap*2, 0],
            ['l', line_len/2 - line_gap, 0],
        ])
            .stroke({width: 3})
            .fill('none')
            .move(this.rect1.cx(), this.rect1.cy());

        this.jumper = this._group.line(
            0, 0,
            line_gap*2, 0
        )
            .stroke({width: 2, color: "#000"})
            .move(this.rect1.cx() + line_len/2 - line_gap, this.rect1.cy());

        this._group.circle(this.rect1.width() / 3).center(this.rect1.cx() + line_len/2 - line_gap, this.rect1.cy());
        this._group.circle(this.rect1.width() / 3).center(this.rect1.cx() + line_len/2 + line_gap, this.rect1.cy());

        this._rotateJumper();
    }
}