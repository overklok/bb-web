import Plate from "../Plate";

/**
 * Класс линейной плашки
 *
 * @class
 * @abstract
 */
export default class LinearPlate extends Plate {
    constructor(container, grid, schematic=false, id, extra) {
        super(container, grid, schematic, id, extra);

        this._params.size = {x: this.__length__, y: 1};

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в кадом измерении)

        this._params.rels = [];

        for (let i = 0; i < this.__length__; i++) {
            this._params.rels.push({x: i, y: 0, adj: {x: 0, y: 0}});
        }
    }

    /**
     * @returns {number}
     * @private
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
                didx = Plate._orientXYObject({x: this.__length__ - 1, y: 0});
            } else {
                didx = Plate._orientXYObject({x: 0, y: this.__length__ - 1});
            }

            return this.__grid.cell(cell_main.pos.x + didx.x, cell_main.pos.y  + didx.y);
        } else {
            return cell_main;
        }
    }
}