import Layer from "../core/Layer";

class LabelLayer extends Layer {
    static get Class() {return "bb-layer-label"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(LabelLayer.Class);

        this._params = {
            thickness: 50,
            width: this.__grid.size.x,
            height: this.__grid.size.y,
            x: 100,
            y: 200-30,
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
            .fill({color: "#ff0001"})
            .opacity(0);

        this._panes.left
            .rect(this._params.thickness, this._params.height)
            .move(this._params.y - this._params.thickness, this._params.x)
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
            let pos_y = this._params.y - size / 2;

            if (i >=1) {
                this._drawLabelText("top", pos_x, pos_y, "A" + (i - 1), this._params.thickness - 20);
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

            let pos_x = this._params.y - size;
            let pos_y = this._params.x + cell.center.y + size;

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
            .font({size: size})
            .center(pos_x, pos_y);
    }

    _drawLabelArrows(pane_name, pos_x, pos_y) {
        this._panes[pane_name]
            .text("U")
            .font({size: this._params.thickness - 20})
            .center(pos_x, pos_y);
    }
}

export default LabelLayer;