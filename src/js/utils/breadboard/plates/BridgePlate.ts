import SVG from 'svg.js';

import Plate, { PlateProps } from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";
import Grid from '../core/Grid';

export default class BridgePlate extends LinearPlate {
    static get Alias() {return "bridge"}

    static get PROP_LENGTH() {return 'len'}

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id?: number,
        props?: PlateProps
    ) {
        super(container, grid, schematic, verbose, id, props);

        this._params.size = {x: Number(this.__length__), y: 1};

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в каждом измерении)

        this._params.rels = [];

        for (let i = 0; i < this.__length__; i++) {
            this._params.rels.push({x: i, y: 0, adj: {x: 0, y: 0}});
        }
    }

    get __defaultProps__() {
        return {
            ...super['__defaultProps__'],
            [BridgePlate.PROP_LENGTH]: 2
        }
    }

    /**
     * @returns {number}
     */
    get __length__(): number {
        return Number(this.props[BridgePlate.PROP_LENGTH]);
    }

    get variant() {
        return String(this.__length__);
    }

    __setProps__(props: PlateProps) {
        super.__setProps__(props);

        let length = Number(props[BridgePlate.PROP_LENGTH]);
        this._props[BridgePlate.PROP_LENGTH] = Number.isInteger(length) ? length : 2;
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position: Cell, orientation: any) {
        this._drawPicture();

        // this._group.text(`Bridge ${this._params.len} cells`).font({size: 20});
    };

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizePreferred) {
        let ls = this._params.schematic ? 10 : 6;

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