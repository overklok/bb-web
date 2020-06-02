import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class RGBPlate extends Plate {
    static get Alias() {return "rgb"}

    constructor(container, grid, schematic=false, verbose=false, id) {
        super(container, grid, false, verbose, id);

        this._params.size = {x: 4, y: 1};
    }

    /**
     * Нарисовать RGB-диод
     *
     * @param {Cell}    position        положение RGB-диода
     * @param {string}  orientation     ориентация RGB-диода
     */
    __draw__(position, orientation) {
        this._bezel.fill("#f09fc9");

        this._drawPicture();
        this._drawLabel('rgb', 40);

        // this._group.text(`Diode ${this._params.colour}`).font({size: 20});
    };

    /**
     * Установить состояние RGB-диода
     *
     * @param {object} state новое состояние RGB-диода
     */
    setState(state, suppress_events) {
        super.setState(state, suppress_events);
    }

    /**
     *
     * @param {number} ls размер светодиода
     * @private
     */
    _drawPicture(ls=Plate.LEDSizeDefault) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, 0);

        let center_x = cell1.center_rel.x + (cell2.pos.x - cell1.pos.x) / 2;
        let center_y = cell1.center_rel.y;

        this._group.rect(ls, ls)
            .center(
                center_x,
                center_y
            )
            .fill('#ffffff')
            .stroke({color: "#e7e7e7", width: 1})
            .attr('filter', 'url(#glow-led)');

        this._group.circle(ls/1.5, ls/1.5)
            .center(
                center_x,
                center_y
            )
            .fill('#e2e2e2');
    }

    _drawLabel(text="", size=Plate.LabelSizeDefault) {
        let cell0 = this.__grid.cell(0, 0),
            cell1 = this.__grid.cell(1, 0),
            cell2 = this.__grid.cell(2, 0),
            cell3 = this.__grid.cell(3, 0);

        this._group.text("R")
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"})
            .center(cell0.center_rel.x, cell0.center_rel.y);

        this._group.text("G")
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"})
            .center(cell1.center_rel.x, cell1.center_rel.y);

        this._group.text("B")
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"})
            .center(cell2.center_rel.x, cell2.center_rel.y);

        this._group.text("C")
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"})
            .center(cell3.center_rel.x, cell3.center_rel.y);

        let label = this._group.text(String(text))
            .font({size: size/2, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"});


        label.x(this._container.width())
            .y(this._container.height() - size)
            .stroke({width: 0.5});
    }
}