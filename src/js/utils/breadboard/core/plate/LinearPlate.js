import Plate from "../Plate";

/**
 * Класс линейной плашки
 *
 * @class
 * @abstract
 */
export default class LinearPlate extends Plate {
    constructor(container, grid, schematic=false, verbose=false, id=null, props=null) {
        super(container, grid, schematic, verbose, id, props);

        this._params.size = {x: this.__length__, y: 1};

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в каждом измерении)

        this._params.rels = [];
        this._params.surface = [];

        for (let i = 0; i < this.__length__; i++) {
            this._params.rels.push({x: i, y: 0, adj: {x: 0, y: 0}});
        }

        for (let i = 0; i < this.__length__; i++) {
            this._params.surface.push({x: i, y: 0});
        }
    }

    /**
     * @returns {number}
     * @protected
     */
    get __length__() {
        return 2;
    }

    /**
     * @private
     */
    __draw__() {
        if (this._params.size.x !== 1 && this._params.size.y !== 1) {
            throw new RangeError("Invalid size of LinearPlate");
        }

        if (this._params.size.x === 1 && this._params.size.y === 1) {
            throw new RangeError("1x1 plate is not allowed to be a LinearPlate");
        }
    }

    /**
     * @param cell
     * @private
     */
    __getOppositeCell__(cell) {
        let cell_main = this._state.cell;

        if (cell === cell_main) {
            let didx = undefined;

            if (this._params.size.x !== 1) {
                didx = Plate._orientXYObject({x: this.__length__ - 1, y: 0}, this.state.orientation);
            } else {
                didx = Plate._orientXYObject({x: 0, y: this.__length__ - 1}, this.state.orientation);
            }

            return this.__grid.cell(cell_main.idx.x + didx.x, cell_main.idx.y  + didx.y);
        }

        let didx = Plate._orientXYObject(
            {x: this._params.size.x - 1, y: this._params.size.y - 1},
            this.state.orientation
        );

        let cell_last =
            this.__grid.cell(cell_main.idx.x + didx.x, cell_main.idx.y + didx.y);

        if (cell === cell_last) {
            return cell_main;
        }
    }
}