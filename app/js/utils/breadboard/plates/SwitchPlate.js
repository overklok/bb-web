import Breadboard from "../Breadboard";
import Plate from "../core/Plate";
import Cell from "../core/Cell";
import {GRADIENTS} from "../styles/gradients";

export default class SwitchPlate extends Plate {
    static get Alias() {return "switch"}

    constructor(container, grid, schematic=false, id) {
        super(container, grid, schematic, id);

        this._params.size = {x: 3, y: 2};

        this._params.surface = [
            {x: 0, y: 0},   {x: 1, y: 0},   {x: 2, y: 0},
                            {x: 1, y: 1}
        ];

        this._params.origin = {x: 1, y: 1};
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Switch`).font({size: 20});
    };

    /**
     * Установить состояние перемычки
     *
     * @param {object} state новое состояние перемычки
     */
    setState(state) {
        super.setState(state);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizeDefault) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(2, 0);
        let cell3 = this.__grid.cell(1, 1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);
        let rect3 = this._group.rect(qs, qs);

        rect1.cx(cell1.center_rel.x).cy(cell1.center_rel.y);
        rect2.cx(cell2.center_rel.x).cy(cell2.center_rel.y);
        rect3.cx(cell3.center_rel.x).cy(cell3.center_rel.y);

        let line_end = {
            x_right: cell3.center_rel.x - qs/2,
            x_left: cell3.center_rel.x + qs/2,
            y: cell1.rel.y + cell1.size.y - qs/2
        };

        let line_right = this._group.path([
            ['M', cell1.center_rel.x, cell1.center_rel.y],
            ['H', cell3.rel.x],
            ['L', line_end.x_right, line_end.y],
        ]);

        let line_left = this._group.path([
            ['M', cell2.center_rel.x, cell2.center_rel.y],
            ['H', cell3.rel.x + cell3.size.x],
            ['L', line_end.x_left, line_end.y],
        ]);

        let line_middle = this._group.path([
            ['M', cell3.center_rel.x, cell3.center_rel.y],
            ['V', line_end.y]
        ]);

        line_right.stroke({width: 3}).fill('none');
        line_left.stroke({width: 3}).fill('none');
        line_middle.stroke({width: 3}).fill('none');

        let body_size = {x: cell1.size.x - Breadboard.CellRadius * 2, y: (cell1.size.y - qs) / 2 + qs / 4};
        let body_pos = {cx: cell3.center_rel.x, y: qs/2 + cell1.rel.y + cell1.size.y - body_size.y};

        let switch_body = this._group
            .rect(body_size.x, body_size.y)
            .cx(body_pos.cx)
            .cy(body_pos.y);

        let switch_washer = this._group
            .circle(body_size.y * 1.15)
            .cx(body_pos.cx)
            .cy(body_pos.y);

        let switch_head_ext = this._group
            .circle(body_size.y)
            .cx(body_pos.cx)
            .cy(body_pos.y);

        let switch_head_int = this._group
            .circle(body_size.y * 0.85)
            .cx(body_pos.cx)
            .cy(body_pos.y);

        let switch_handle = this._group
            .circle(body_size.y * 0.3)
            .cx(body_pos.cx)
            .cy(body_pos.y);

        switch_body.fill(GRADIENTS.SILVER.HORZ);
        switch_washer.fill(GRADIENTS.SILVER.RADIAL);
        switch_head_ext.fill(GRADIENTS.SILVER.RADIAL);
        switch_head_int.fill("#000");
        switch_handle.fill(GRADIENTS.SILVER.RADIAL);
    }
}