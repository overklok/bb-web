import Plate from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";

export default class BridgePlate extends LinearPlate {
    static get Alias() {return "bridge"}

    constructor(container, grid, schematic=false, verbose=false, id, length=2) {
        super(container, grid, schematic, verbose, id, length);

        length = Number(length);
        length = Number.isInteger(length) ? length : 2;

        this._params.extra = (length < 2) ? 2 : length;

        this._params.size = {x: this.__length__, y: 1};

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в каждом измерении)

        this._params.rels = [];

        for (let i = 0; i < this.__length__; i++) {
            this._params.rels.push({x: i, y: 0, adj: {x: 0, y: 0}});
        }
    }

    get __length__() {
        return this._params.extra;
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Bridge ${this._params.len} cells`).font({size: 20});
    };

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizeDefault) {
        let ls = this.__schematic ? 10 : 6;

        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);

        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        this._group.rect(rect2.x() - rect1.x(), ls)
            .x(cell1.center_rel.x)
            .cy(cell1.center_rel.y);
    }
}