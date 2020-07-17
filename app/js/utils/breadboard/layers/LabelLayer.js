import Layer from "../core/Layer";
import Grid from "../core/Grid";
import {GRADIENTS} from "../styles/gradients";

const SYMBOL_UP = "🠩"
const SYMBOL_DOWN = "🠫"

const CELL_ROLES = {
    Plus: 'plus',
    Minus: 'minus',
    Analog: 'analog',
    None: 'none'
}

export default class LabelLayer extends Layer {
    static get Class() {return "bb-layer-label"}

    static get CellRoles() {return CELL_ROLES}

    constructor(container, grid, schematic=false) {
        super(container, grid, schematic);

        this._container.addClass(LabelLayer.Class);

        this._params = {
            thickness: 50,
            width: this.__grid.size.x,
            height: this.__grid.size.y,
        };

        this._domaingroup = undefined;

        this._domain_config = undefined;

        this._pinval_labels = [];

        this._initGroups();
    }

    setDomainConfig(domain_config) {
        this._domain_config = domain_config;
    }

    compose() {
        this._drawLabels();
    }

    recompose(schematic, detailed) {
        super.recompose(schematic, detailed);

        this._initGroups();
        this.compose();
    }

    _initGroups() {
        this._clearGroups();

        this._domaingroup = this._container.group();
    }

    _clearGroups() {
        if (this._domaingroup)  this._domaingroup.remove();
    }

    setPinsValues(values) {
        if (!values || !Array.isArray(values)) {
            throw new TypeError("Pin values must be an array");
        }

        let i = 0;

        for (let col of this.__grid.cells) {
            const cell = col[0];

            const [mode, value] = values.hasOwnProperty(i) ? values[i] : [null, 0];
            const pos_x = cell.center.x;

            let arrow = "",
                color = 'black';

            if (mode === 'input') {
                arrow = SYMBOL_UP;
                color = "green";
            }

            if (mode === 'output') {
                arrow = SYMBOL_DOWN;
                color = "red";
            }

            if (value === 0) {
                arrow = "";
                color = "black";
            }

            this._pinval_labels[i].text(`${value}${arrow}`).fill(color).cx(pos_x);

            i++;
        }
    }

    _drawLabels() {
        if (!this._domain_config) return;

        const   font_size = (this.__schematic && this.__detailed) ? 30 : 20,
                text_bias = (this.__schematic && this.__detailed) ? 10 : -4;

        for (const domain of this._domain_config) {
            const d_from = this.__grid.cell(domain.from.x, domain.from.y, Grid.BorderTypes.Wrap).idx,
                  d_to   = this.__grid.cell(domain.to.x, domain.to.y, Grid.BorderTypes.Wrap).idx;

            let text = "",
                pin_num = (domain.pins_to == null) ? domain.pins_from : domain.pins_to,
                pin_dir = (domain.pins_to == null) ? 1 : -1;

            pin_num = pin_num || 0;

            switch (domain.role) {
                case LabelLayer.CellRoles.Plus:     {text = "+"; break;}
                case LabelLayer.CellRoles.Minus:    {text = "-"; break;}
            }

            for (let row = d_from.y; row <= d_to.y; row++) {
                for (let col = d_from.x; col <= d_to.x; col++) {
                    const cell = this.__grid.cell(col, row);

                    if (domain.role === LabelLayer.CellRoles.Analog) {
                        text = `A${pin_num}`;
                    }

                    let pos_y = cell.center.y - cell.size.y - text_bias;

                    switch (domain.label_pos) {
                        case "top":     pos_y = cell.center.y - cell.size.y - text_bias/2; break;
                        case "bottom":  pos_y = cell.center.y + cell.size.y + text_bias/2; break;
                        default:        pos_y = cell.pos.y + text_bias; break;
                    }

                    this._drawLabelText(cell.center.x, pos_y, text, font_size);

                    pin_num += pin_dir;
                }
            }
        }
    }

    _drawLabelsTop() {
        let i = 0;

        for (let col of this.__grid.cells) {
            const cell = col[0];

            const pos_x = cell.center.x,
                  pos_y_pin = cell.pos.y - this._params.thickness * 1.3,
                  pos_y_pinval = cell.pos.y - this._params.thickness / 2;

            this._drawLabelText(pos_x, pos_y_pin, "A" + (i), this._params.thickness / 2);

            this._pinval_labels.push(
                this._drawLabelText(pos_x, pos_y_pinval, "0", 36, "900")
            );

            i++;
        }
    }

    _drawLabelsLeft() {
        let cell_cols = this.__grid.cells.length;
        let i = 0;

        for (let cell of this.__grid.cells[0]) {
            let pos_x = cell.pos.x - this._params.thickness / 2;
            let pos_y = cell.center.y;

            if (i === cell_cols) {
                // this._drawLabelText(pos_x, pos_y, "-", this._params.thickness);
            }

            if (i === 1) {
                // this._drawLabelText(pos_x, pos_y, "+", this._params.thickness);
            }

            i++;
        }
    }

    _drawLabelText(pos_x, pos_y, text, size, weight="bold") {
        return this._domaingroup
            .text(text)
            .font({size, weight, family: "'Lucida Console', Monaco, monospace"})
            .center(pos_x, pos_y);

        // .rect(this._params.width, this._params.thickness)
        //     .dy(-this._params.thickness)
        //     .fill({color: "#77ff1b"})
        //     .opacity(0);
    }

    _drawLabelArrows(pane_name, pos_x, pos_y) {
        let wrap = this._panes[pane_name].nested();

        let cell = this.__grid.cell(0,0);

        let w = cell.size.x / 2.8,        // width
            h = cell.size.y / 7;      // height

        let p = cell.size.y / 7;      // padding

        wrap.path([
            ['M', 0, 0],    ['l', w/2, h], ['l', w/2, -h],
            ['m', -w, p],   ['l', w/2, h], ['l', w/2, -h],
            ['m', -w, p],   ['l', w/2, h], ['l', w/2, -h],
        ])
            .fill({opacity: 0})
            .stroke({color: "#000", width: 5})
            .center(pos_x, pos_y)
            .y(pos_y - p * 2);
    }
}