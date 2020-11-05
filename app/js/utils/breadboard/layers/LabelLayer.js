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

const LABEL_STYLE_DEFAULT = {
    font_size: 20,
    text_bias: 10,
}

export default class LabelLayer extends Layer {
    static get Class() {return "bb-layer-label"}

    static get CellRoles() {return CELL_ROLES}

    constructor(container, grid, schematic=false, detailed=false) {
        super(container, grid, schematic, detailed);

        this._container.addClass(LabelLayer.Class);

        this._params = {
            thickness: 50,
            width: this.__grid.size.x,
            height: this.__grid.size.y,
        };

        this._domaingroup = undefined;

        this._domain_config = undefined;

        this._pinval_labels = [];

        this._label_style = {
            font_size: LABEL_STYLE_DEFAULT.font_size,
            text_bias: LABEL_STYLE_DEFAULT.text_bias,
        }

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

    setLabelStyle(style) {
        if (style && style.font_size != null) {
            this._label_style.font_size = style.font_size;
        } else {
            this._label_style.font_size = LABEL_STYLE_DEFAULT.font_size;
        }

        if (style && style.text_bias != null) {
            this._label_style.text_bias = style.text_bias;
        } else {
            this._label_style.text_bias = LABEL_STYLE_DEFAULT.text_bias;
        }
    }

    _initGroups() {
        this._clearGroups();

        this._domaingroup = this._container.group();
    }

    _clearGroups() {
        if (this._domaingroup)  this._domaingroup.remove();
    }

    setPinsValues(values_arr) {
        if (!values_arr || !Array.isArray(values_arr)) {
            throw new TypeError("Pin values must be an array");
        }

        let i = 0;

        for (const pinval_label of this._pinval_labels) {
            const [mode, value] = values_arr.hasOwnProperty(i) ? values_arr[i] : [null, 0];

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

            if (mode !== null) {
                pinval_label.text(`${value}${arrow}`).fill(color).font({anchor: 'middle'});
            } else {
                pinval_label.text(``).fill('black').font({anchor: 'middle'});
            }

            i++;
        }
    }

    _drawLabels() {
        if (!this._domain_config) return;

        const   font_size = this._label_style.font_size,
                text_bias = this._label_style.text_bias;

        for (const domain of this._domain_config) {
            if (domain.no_labels) continue;

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

            const [d_from_y, d_to_y] = d_from.y > d_to.y ? [d_to.y, d_from.y] : [d_from.y, d_to.y],
                  [d_from_x, d_to_x] = d_from.x > d_to.x ? [d_to.x, d_from.x] : [d_from.x, d_to.x];

            for (let row = d_from_y; row <= d_to_y; row++) {
                for (let col = d_from_x; col <= d_to_x; col++) {
                    const cell = this.__grid.cell(col, row);

                    if (domain.role === LabelLayer.CellRoles.Analog) {
                        text = `A${pin_num}`;
                    }

                    let pos_y = cell.center.y - cell.size.y - text_bias;

                    switch (domain.label_pos) {
                        case "top":     pos_y = cell.center.y - cell.size.y - text_bias/2; break;
                        case "bottom":  pos_y = cell.center.y + cell.size.y + text_bias/2; break;
                        default:        pos_y = cell.center.y - cell.size.y/2 - text_bias; break;
                    }

                    this._drawLabelText(cell.center.x, pos_y, text, font_size);

                    if (domain.role === LabelLayer.CellRoles.Analog) {
                        let cx = cell.center.x,
                            cy = pos_y;

                        switch (domain.value_orientation) {
                            case 'north':   {cy -= cell.size.y * .6; break;}
                            case 'south':   {cy += cell.size.y * .6; break;}
                            case 'west':    {cx -= cell.size.x * 1.2; break;}
                            case "east":    {cx += cell.size.x * 1.2; break;}
                        }

                        this._pinval_labels[pin_num] =
                            this._drawLabelText(cx, cy, '', font_size + 4);
                    }

                    pin_num += pin_dir;
                }
            }
        }
    }

    _drawLabelText(pos_x, pos_y, text, size, weight="bold") {
        return this._domaingroup
            .text(text)
            .font({size, weight, family: "'IBM Plex Mono', 'Lucida Console', Monaco, monospace"})
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