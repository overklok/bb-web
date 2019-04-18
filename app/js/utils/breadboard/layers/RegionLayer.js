import Layer from "../core/Layer";

export default class RegionLayer extends Layer {
    static get Class() {return "bb-layer-region"}

    constructor(container, grid, schematic=false) {
        super(container, grid, schematic);

        this._container.addClass(RegionLayer.Class);

        this._regiongroup   = undefined;
    }

    compose() {
        this._drawRegions();
    }

    highlightRegion(from, to, clear=false, color="#d40010") {
        if (clear) {
            this._regiongroup.clear();
        }

        if (!from || !to) {return false}

        if (from.x == null || from.y == null) {return false}
        if (to.x == null || to.y == null) {return false}

        if (from.x >= this.__grid.dim.x || to.x >= this.__grid.dim.x) {
            throw new RangeError("X coordinate does not fit the grid's dimension");
        }

        if (from.y >= this.__grid.dim.y || to.y >= this.__grid.dim.y) {
            throw new RangeError("Y coordinate does not fit the grid's dimension");
        }

        let cell_from = this.__grid.cell(from.x, from.y);
        let cell_to = this.__grid.cell(to.x, to.y);

        let width = Math.abs(cell_from.pos.x - cell_to.pos.x) + cell_from.size.x + this.__grid.gap.x * 2;
        let height = Math.abs(cell_from.pos.y - cell_to.pos.y) + cell_from.size.y + this.__grid.gap.y * 2;

        let quad = this._regiongroup
            .rect(width, height)
            .move(cell_from.pos.x - this.__grid.gap.x, cell_from.pos.y - this.__grid.gap.y)
            .radius(10)
            .fill({color: color, opacity: 0.2})
            .stroke({color: color, width: 2})
            .scale(1.2)
            .animate(250, '<>', 0).scale(1)
            .animate(1000).fill({opacity: 0.6}).loop(100000, true);
    }

    clearRegions() {
        this._regiongroup.clear();
    }

    _drawRegions() {
        this._regiongroup = this._container.group().id("regiongroup");
        // this._regiongroup.move(100, 170);
    }

    _highlightOccupiedCells() {
        this._regiongroup.clear();

        for (let col of this.__grid.cells) {
            for (let cell of col) {
                if (cell.occupied) {
                    this.highlightRegion(cell.idx, cell.idx)
                }
            }
        }
    }
}