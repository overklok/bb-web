import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class RheostatPlate extends Plate {
    static get Alias() {return "rheostat"}

    constructor(container, grid, id) {
        super(container, grid, id);

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: 3, y: 1};

        this._state = {
            highlighted: false,
        }
    }

    /**
     * Нарисовать резистор
     *
     * @param {Cell}   position    положение резистора
     * @param {string}  orientation ориентация резистора
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Resistor ${this._params.resistance} Ohm`).font({size: 20});
    };

    /**
     * Установить состояние резистора
     *
     * @param {object} state новое состояние резистора
     */
    setState(state) {
        super.setState(state);
    }

    /**
     * Переместить резистор
     *
     * @param {Cell} position положение резистора
     */
    move(position) {
        super.move(position);
    }

    /**
     * Переместить резистор
     *
     * @param {int} dx смещение резистора по оси X
     * @param {int} dy смещение резистора по оси Y
     */
    shift(dx, dy) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть резистор
     *
     * @param {string} orientation ориентация резистора
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
        let cell2 = this.__grid.cell(this._size.x-1, this._size.y-1);

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

        let body = this._group.rect(qs * 2, qs / 1.5)
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy());

        let arrow_height = qs;
        let arrow_width = qs * 2;

        let arrow = this._group.polyline([
            [arrow_width, -arrow_height],
            [0, -arrow_height],
            [0, 0],
        ])
            .stroke({width: 2})
            .fill("none")
            .x(body.cx())
            .y(body.y() - arrow_height);

        arrow.marker('end', qs/2, qs/2, function(add) {
            add.path([
                ['M', 0, 0],
                ['l', -qs/2, -qs/4],
                ['l', 0, qs/2],
                ['l', qs/2, -qs/4],
            ])
                .fill('#000')
                .stroke({width: 0.5})
                .move(-qs/4, 0);
        })
    }
}