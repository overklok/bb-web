import Layer from "../core/Layer";

class LabelLayer extends Layer {
    constructor(container, grid) {
        super(container, grid);

        this._container.id("label");

        this._params = {
            top: {
                size: {
                    x: this.__grid.size.x,
                    y: 50
                },
                pos: {
                    x: 200,
                    y: 200
                }
            },
            left: {
                size: {
                    x: 50,
                    y: this.__grid.size.y
                },
                pos: {
                    x: 200,
                    y: 200
                }
            }
        };

        this._panes = {
            top: this._container.nested(),
            left: this._container.nested()
        }
    }

    compose() {
        this._panes.top
            .rect(this._params.top.size.x, this._params.top.size.y)
            .move(this._params.top.pos.x, this._params.top.pos.y - this._params.top.size.y)
            .fill({color: "#ff0001"});

        this._panes.left
            .rect(this._params.left.size.x, this._params.left.size.y)
            .move(this._params.left.pos.x - this._params.left.size.x, this._params.left.pos.y)
            .fill({color: "#ff0001"});

        this._drawLabelsTop();
        this._drawLabelsLeft();
    }

    _drawLabelsTop() {
        for (let col of this.__grid.cells) {
            let cell = col[0];
            let size = this._params.top.size.y;

            let pos_x = this._params.top.pos.x + cell.center.x - size / 2;
            let pos_y = this._params.top.pos.y - size;

            this._panes.top
                .rect(size, size)
                .move(pos_x, pos_y)
                .fill({color: "#0F0"});
        }
    }

    _drawLabelsLeft() {
        for (let cell of this.__grid.cells[0]) {
            let size = this._params.left.size.x;

            let pos_x = this._params.left.pos.x - size;
            let pos_y = this._params.left.pos.y + cell.center.y - size / 2;

            this._panes.left
                .rect(size, size)
                .move(pos_x, pos_y)
                .fill({color: "#0FF"});
        }
    }
}

export default LabelLayer;