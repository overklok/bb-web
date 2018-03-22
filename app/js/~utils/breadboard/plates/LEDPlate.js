import Plate from "../core/Plate";
import Cell from "../core/Cell";

class LEDPlate extends Plate {
    static get Alias() {return "LED"}

    constructor(container, grid, id, colour='R') {
        super(container, grid, id, colour);

        this._extra = this._params.colour = colour;

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: 2, y: 1};

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
    draw(position, orientation) {
        super.draw(position, orientation);

        this._bezel.fill({color: "#fffffd"}).radius(10);
        this._bezel.stroke({color: "#fffffd", width: 2});

        this._drawPicture();
        this._drawLabel(this._params.colour);

        // this._group.text(`Diode ${this._params.colour}`).font({size: 20});
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

        let trng = this._group.polyline([
            [0, 0],
            [0, qs*3/2],
            [qs, qs*3/4],
            [0, 0],
        ])
            .stroke({width: 1})
            .fill("#fffffd")
            .cx(rect1.cx() + line_len / 2)
            .cy(rect1.cy());

        let ptrpath = [
            [0, 0],
            [qs/2, -qs/2],
            [qs/2-7, -qs/2+4],
            [qs/2-4, -qs/2+7],
            [qs/2, -qs/2],
        ];

        let ptr1 = this._group.polyline(ptrpath).stroke({width: 1}).fill("#000");
        let ptr2 = this._group.polyline(ptrpath).stroke({width: 1}).fill("#000");

        ptr1.move(trng.x() + trng.width() / 2, trng.y() - trng.height() / 4);
        ptr2.move(trng.x() + trng.width() / 2 + 5, trng.y() - trng.height() / 4 + 5);
    }

    _drawLabel(text="", size=16) {
        this._group.text(String(text))
            .font({size: size, family: "'Lucida Console', Monaco, monospace", weight: "bolder"})
            .cx(this._container.width() - size)
            .cy(this._container.height() - size)
            .stroke({width: 0.5})
    }
}

export default LEDPlate;