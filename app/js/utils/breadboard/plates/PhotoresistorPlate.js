import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class PhotoresistorPlate extends Plate {
    static get Alias() {return "photoresistor"}

    constructor(container, grid, id) {
        super(container, grid, id);

        this._params.size = {x: 2, y: 1};
    }

    /**
     * Нарисовать фоторезистор
     *
     * @param {Cell}    position    положение фоторезистора
     * @param {string}  orientation ориентация фоторезистора
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Resistor ${this._params.resistance} Ohm`).font({size: 20});
    };

    /**
     * Установить состояние фоторезистора
     *
     * @param {object} state новое состояние фоторезистора
     */
    setState(state) {
        super.setState(state);
    }

    /**
     * Переместить фоторезистор
     *
     * @param {int} dx смещение фоторезистора по оси X
     * @param {int} dy смещение фоторезистора по оси Y
     */
    shift(dx, dy) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть фоторезистор
     *
     * @param {string} orientation ориентация фоторезистора
     */
    rotate(orientation) {
        super.rotate(orientation);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=20) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(this._params.size.x-1, this._params.size.y-1);

        let rect1 = this._group.rect(qs, qs)
            .center(
                cell1.center.x - qs / 2,
                cell1.center.y - qs / 2
            );

        let rect2 = this._group.rect(qs, qs)
            .center(
                cell2.center.x - qs / 2,
                cell2.center.y - qs / 2
            );

        let line_len = rect2.x() - rect1.x();

        this._group.polyline([
            [0, 0],
            [line_len, 0]
        ])
            .stroke({width: 1})
            .fill('none')
            .move(rect1.cx(), rect2.cy());

        let frame = this._group.rect(line_len / 2, qs*1.2)
            .stroke({width: 1})
            .fill("#fffffd")
            .radius(qs/1.5)
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy());

        this._group.path([
            ['M', 0, 0],
            ['c', 0, qs/4.2+1, -line_len / 6, 0, -line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1,  line_len / 6, 0,  line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1, -line_len / 6, 0, -line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1,  line_len / 6, 0,  line_len / 6, qs/4.2],
            ['c', 0, qs/4.2+1, -line_len / 6, 0, -line_len / 6, qs/4.2],
        ])
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(frame.cx())
            .y(frame.y());

        this._group.line(0, 0, 0, qs/1.5)
            .stroke({width: qs/6, color: "#fffffd"})
            .center(frame.cx(), frame.cy());

        this._group
            .circle(qs/6, qs/6)
            .center(frame.cx(), frame.cy());
    }
}