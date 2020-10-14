import Plate from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";

export default class InductorPlate extends LinearPlate {
    static get Alias() {return "inductor"}

    static get PROP_INDUCTANCE() {return "ind"}

    constructor(container, grid, schematic=false, verbose=false, id, props) {
        super(container, grid, schematic, verbose, id, props);
    }

    get __defaultProps__() {
        return {
            [InductorPlate.PROP_INDUCTANCE]: 100
        }
    }

    __setProps__(props) {
        super.__setProps__(props);

        this._props[InductorPlate.PROP_INDUCTANCE] = Number(this._props[InductorPlate.PROP_INDUCTANCE]);
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Button`).font({size: 20});
    };

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizePreferred) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);

        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        rect2.center(cell2.center_rel.x, cell2.center_rel.y);


        let line_len = rect2.x() - rect1.x();

        let line_gap = line_len / 4;

        this._group.path([
            ['M', 0, 0],
            ['l', line_len/2 - line_gap, 0],
            ['m', line_gap*2, 0],
            ['l', line_len/2 - line_gap, 0],
        ])
            .stroke({width: 3})
            .fill('none')
            .move(rect1.cx(), rect1.cy());

        let circ_base_x = rect1.cx() + line_len/2 - line_gap;

        for (let i = 0; i < 3; i++) {
            this._group.circle(line_gap / 1.5)
                .x(circ_base_x + (line_gap / 1.5 * i))
                .cy(rect1.cy())
                .fill('none')
                .stroke({width: 3, dasharray: [0, line_gap, line_gap * 1.5]});
        }
    }
}