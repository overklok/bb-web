import Breadboard from "../Breadboard";
import Plate from "../core/Plate";
import Cell from "../core/Cell";
import {GRADIENTS} from "../styles/gradients";
import SwitchPlateContextMenu from "../menus/plate/SwitchPlateContextMenu";

export default class SwitchPlate extends Plate {
    static get Alias() {return "switch"}

    constructor(container, grid, schematic=false, id) {
        super(container, grid, schematic, id);

        this._params.size = {x: 3, y: 2};

        this._params.surface = [
            {x: 0, y: 0},   {x: 1, y: 0},   {x: 2, y: 0},
                            {x: 1, y: 1}
        ];

        this._params.origin = {x: 0, y: 0};


    }

    __cm_class__() {
        return SwitchPlateContextMenu;
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
    setState(state, suppress_events) {
        super.setState(state, suppress_events);
        this._ctxmenu.setValue(state.input);
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

        let contact_point = {
            x: cell3.center_rel.x,
            y: cell1.rel.y + cell1.size.y
        };

        let line_right = this._group.path([
            ['M', cell1.center_rel.x, cell1.center_rel.y],
            ['H', cell3.rel.x],
            // ['L', contact_node.x, contact_node.y],
        ]);

        let line_left = this._group.path([
            ['M', cell2.center_rel.x, cell2.center_rel.y],
            ['H', cell3.rel.x + cell3.size.x],
            ['L', contact_point.x, contact_point.y],
        ]);

        let line_middle = this._group.path([
            ['M', cell3.center_rel.x, cell3.center_rel.y],
            ['V', contact_point.y]
        ]);

        line_right.stroke({width: 3}).fill('none');
        line_left.stroke({width: 3}).fill('none');
        line_middle.stroke({width: 3}).fill('none');
    }
}