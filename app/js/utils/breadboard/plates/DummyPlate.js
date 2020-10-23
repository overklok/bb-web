import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class DummyPlate extends Plate {
    static get Alias() {return "dummy"}

    constructor(container, grid, schematic=false, verbose=false, id) {
        super(container, grid, false, verbose, id);

        this._params.size = {x: 1, y: 1};
    }

    /**
     * Нарисовать RGB-диод
     *
     * @param {Cell}    position        положение RGB-диода
     * @param {string}  orientation     ориентация RGB-диода
     */
    __draw__(position, orientation) {
        this._bezel.fill("none").stroke({color: "none", opacity: 0});

        this._drawPicture();
    };

    deselect() {
        super.deselect();

        this._bezel.stroke({color: "none", opacity: 0});
    }

    /**
     *
     * @private
     * @param qs
     */
    _drawPicture(qs=Plate.QuadSizePreferred) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, 0);

        let center_x = cell1.center_rel.x + (cell2.pos.x - cell1.pos.x) / 2;
        let center_y = cell1.center_rel.y;

        const radius = qs * 1.5;

        const dot = this._group.circle(radius, radius)
            .center(
                center_x,
                center_y
            )
            .fill('#ff3a47');

        dot.animate('1200ms').radius(0).loop();
    }
}