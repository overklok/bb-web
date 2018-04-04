import Layer from "../core/Layer";

export default class LabelLayer extends Layer {
    static get Class() {return "bb-layer-label"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(LabelLayer.Class);

        this._params = {
            thickness: 50,
            width: this.__grid.size.x,
            height: this.__grid.size.y,
            x: 100,
            y: 160,
        };

        this._panes = {
            top: this._container.nested(),
            left: this._container.nested()
        }
    }

    compose() {
        this._panes.top
            .rect(this._params.width, this._params.thickness)
            .move(this._params.x, this._params.y - this._params.thickness)
            .fill({color: "#77ff1b"})
            .opacity(0);

        this._panes.left
            .rect(this._params.thickness, this._params.height)
            .move(this._params.x - this._params.thickness, this._params.y)
            .fill({color: "#ff0001"})
            .opacity(0);

        this._drawLabelsTop();
        this._drawLabelsLeft();
    }

    _drawLabelsTop() {
        let i = 0;

        for (let col of this.__grid.cells) {
            let cell = col[0];
            let size = this._params.thickness;

            let pos_x = this._params.x + cell.center.x;
            let pos_y = this._params.y - size / 4;

            if (i >=1) {
                this._drawLabelText("top", pos_x, pos_y, "A" + (i - 1), this._params.thickness / 2);
            } else {
                this._drawLabelArrows("top", pos_x, pos_y);
            }

            i++;
        }
    }

    _drawLabelsLeft() {
        let cell_cols = this.__grid.cells.length;
        let i = 0;

        for (let cell of this.__grid.cells[0]) {
            let size = this._params.thickness;

            let pos_x = this._params.x - size / 2;
            let pos_y = this._params.y + cell.center.y;

            if (i === cell_cols) {
                this._drawLabelText("left", pos_x, pos_y, "-", this._params.thickness);
            }

            if (i === cell_cols - 1) {
                this._drawLabelText("left", pos_x, pos_y, "+", this._params.thickness);
            }

            i++;
        }
    }

    _drawLabelText(pane_name, pos_x, pos_y, text, size) {
        this._panes[pane_name]
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