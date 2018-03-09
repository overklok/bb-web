import Layer from "../core/Layer";

class BackgroundLayer extends Layer {
    static get Class() {return "bb-layer-background"}

    constructor(container, grid) {
        super(container, grid);

        this._container.addClass(BackgroundLayer.Class);

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
                    .fill({color: "#000", opacity: 1})
                    .radius(10);
            }
        }

        this._cellgroup.move(100, 200);
    }
}

export default BackgroundLayer;