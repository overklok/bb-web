import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class WS2801Plate extends Plate {
    static get Alias() {return "ws2801"}

    constructor(container, grid, id) {
        super(container, grid, id);

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
        this._drawLabel('вээс 2801', 20);

        // this._group.text(`Diode ${this._params.colour}`).font({size: 20});
    };

    /**
     * Установить состояние RGB-диода
     *
     * @param {object} state новое состояние RGB-диода
     */
    setState(state) {
        super.setState(state);
    }

    /**
     * Переместить RGB-диод
     *
     * @param {int} dx смещение RGB-диода по оси X
     * @param {int} dy смещение RGB-диода по оси Y
     */
    shift(dx, dy) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть RGB-диод
     *
     * @param {string} orientation ориентация RGB-диода
     */
    rotate(orientation) {
        super.rotate(orientation);
    }

    /**
     *
     * @param {number} ls размер светодиода
     * @private
     */
    _drawPicture(ls=20) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x, 0);

        let center_x = (cell2.pos.x - cell1.pos.x) / 2;
        let center_y = cell1.center_rel.y;

        this._group.rect(ls, ls)
            .center(
                center_x - ls / 2,
                center_y - ls / 2
            )
            .fill('#ffffff')
            .stroke({color: "#e7e7e7", width: 1})
            .attr('filter', 'url(#glow-led)');

        this._group.circle(ls/1.5, ls/1.5)
            .center(
                center_x - ls / 2,
                center_y - ls / 2
            )
            .fill('#e2e2e2');
    }

    _drawLabel(text="", size=16) {
        let label = this._group.text(String(text))
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder", anchor: "end"});


        label.x(this._container.width())
            .y(this._container.height() - size)
            .stroke({width: 0.5});
    }
}