import Layer from "../core/Layer";

const SYMBOL_UP = "🠩"
const SYMBOL_DOWN = "🠫"

export default class LabelLayer extends Layer {
    static get Class() {return "bb-layer-label"}

    constructor(container, grid, schematic=false) {
        super(container, grid, schematic);

        this._container.addClass(LabelLayer.Class);

        this._params = {
            thickness: 50,
            width: this.__grid.size.x,
            height: this.__grid.size.y,
        };

        this._panes = {
            top: this._container.nested(),
            left: this._container.nested()
        }

        this._pinval_labels = [];
    }

    compose() {
        this._panes.top
            .rect(this._params.width, this._params.thickness)
            .dy(-this._params.thickness)
            .fill({color: "#77ff1b"})
            .opacity(0);

        this._panes.left
            .rect(this._params.thickness, this._params.height)
            .dx(-this._params.thickness)
            .fill({color: "#ff0001"})
            .opacity(0);

        this._drawLabelsTop();
        this._drawLabelsLeft();
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

    _drawLabelsTop() {
        let i = 0;

        for (let col of this.__grid.cells) {
            const cell = col[0];

            const pos_x = cell.center.x,
                  pos_y_pin = cell.pos.y - this._params.thickness,
                  pos_y_pinval = cell.pos.y - this._params.thickness / 2;

            this._drawLabelText("top", pos_x, pos_y_pin, "A" + (i), this._params.thickness / 2);

            this._pinval_labels.push(
                this._drawLabelText("top", pos_x, pos_y_pinval, "0")
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
                // this._drawLabelText("left", pos_x, pos_y, "-", this._params.thickness);
            }

            if (i === 1) {
                // this._drawLabelText("left", pos_x, pos_y, "+", this._params.thickness);
            }

            i++;
        }
    }

    _drawLabelText(pane_name, pos_x, pos_y, text, size) {
        return this._panes[pane_name]
            .text(text)
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bold"})
            .center(pos_x, pos_y);
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