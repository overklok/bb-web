import Layer from "../core/Layer";

class BackgroundLayer extends Layer {
    constructor(container, grid) {
        super(container, grid);

        this._container.id("background");

        this._cellgroup = undefined;
    }

    compose() {
        this._container
            .rect('100%', '100%')
            .radius(10)
            .fill({color: "#ff00c0"});

        this._drawCells();
    }

    _drawCells() {
        this._cellgroup = this._container.group();

        for (let col of this.__grid.cells) {
            for (let cell of col) {
                this._cellgroup
                    .rect(cell.size.x, cell.size.y)
                    .move(cell.pos.x, cell.pos.y)
                    .fill({color: "#000", opacity: 1});
            }
        }

        this._cellgroup.move(200, 200);
    }
}

export default BackgroundLayer;