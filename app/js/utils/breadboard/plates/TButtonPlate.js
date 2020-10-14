import Plate from "../core/Plate";
import Cell from "../core/Cell";
import ButtonPlate from "./ButtonPlate";

export default class TButtonPlate extends ButtonPlate {
    static get Alias() {return "button_t"}

    constructor(container, grid, schematic=false, verbose=false, id) {
        super(container, grid, schematic, verbose, id);
    }

    /**
     * @returns {number}
     * @private
     */
    get __length__() {
        return 3;
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        if (this._params.verbose) {
            this._redrawInput(this._state.input);
        }

        // this._group.text(`Switch`).font({size: 20});
    };

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizePreferred) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(2, 0);
        let cell3 = this.__grid.cell(1, 0);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);
        // let rect3 = this._group.rect(qs, qs);

        rect1.cx(cell1.center_rel.x).cy(cell1.center_rel.y);
        rect2.cx(cell2.center_rel.x).cy(cell2.center_rel.y);
        // rect3.cx(cell3.center_rel.x).cy(cell3.center_rel.y);

        let line_right = this._group.path([
            ['M', cell1.center_rel.x, cell1.center_rel.y],
            ['H', cell3.rel.x],
            // ['L', contact_node.x, contact_node.y],
        ]);

        let line_left = this._group.path([
            ['M', cell2.center_rel.x, cell2.center_rel.y],
            ['H', cell3.rel.x + cell3.size.x],
        ]);

        line_right.stroke({width: 3}).fill('none');
        line_left.stroke({width: 3}).fill('none');

        let line_len = rect2.x() - rect1.x();
        let line_gap = line_len / 6;

        this._group.line(
            0, 0,
            line_gap*2, 0
        )
            .stroke({width: 2, color: "#000"})
            .move(rect1.cx() + line_len/2 - line_gap, rect1.cy())
            .rotate(-25, rect1.cx() + line_len/2 - line_gap, rect1.cy());

        this._group.circle(rect1.width() / 3).center(rect1.cx() + line_len/2 - line_gap, rect1.cy());
        this._group.circle(rect1.width() / 3).center(rect1.cx() + line_len/2 + line_gap, rect1.cy());
    }
}