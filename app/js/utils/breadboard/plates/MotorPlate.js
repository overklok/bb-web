import LinearPlate from "../core/plate/LinearPlate";
import Plate from "../core/Plate";

export default class MotorPlate extends LinearPlate {
    static get Alias() {return "motor"}

    constructor(container, grid, schematic=false, verbose=false, id) {
        super(container, grid, schematic, verbose, id);

        this._params.size = {x: 2, y: 1};
    }

    /**
     * Нарисовать электромотор
     *
     * @param {Cell}    position        положение RGB-диода
     * @param {string}  orientation     ориентация RGB-диода
     */
    __draw__(position, orientation) {
        this._bezel.fill({color: "#f0a67a", opacity: 1});

        this._drawPicture();
        this._drawLabel('мотор', 40);

        // this._group.text(`Diode ${this._params.colour}`).font({size: 20});
    };

    /**
     *
     * @param {number} qs размер квадрата
     * @private
     */
    _drawPicture(qs=Plate.LabelSizeDefault) {
        let cell1 = this.__grid.cell(0, 0);
        let rect1 = this._group.rect(qs, qs);
        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
    }

    _drawLabel(text="", size=Plate.LabelSizeDefault) {
        let label = this._group.text(String(text))
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"});


        label.x(this._container.width())
            .y(this._container.height() - size)
            .stroke({width: 0.5});
    }
}