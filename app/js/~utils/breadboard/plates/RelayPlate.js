import Plate from "../core/Plate";
import Cell from "../core/Cell";

class RelayPlate extends Plate {
    static get Alias() {return "relay"}

    constructor(container, grid, id, resistance) {
        super(container, grid, id, resistance);

        this._params.resistance = (resistance <= 0) ? 200 : resistance;
        this._extra = this._params.resistance;

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: 5, y: 1};

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
        let cells = [];
        let rects = [];
        let paths = [];

        for (let i = 0; i < 5; i++) {
            let cell = this.__grid.cell(i, 0);

            let rect = this._group.rect(qs, qs)
                .center(
                    cell.center.x - qs / 2,
                    cell.center.y - qs / 2
                );

            cells.push(cell);
            rects.push(rect);
        }

        paths[0] = this._group.polyline([
            [0, 0],
            [0, -qs/2],
            [cells[1].pos.x - cells[0].pos.x + qs, -qs/2]
        ])
            .move(rects[0].cx(), rects[0].y() - qs/2)
            .stroke({width: 2, color: "#000"}).fill('none');

        paths[1] = this._group.polyline([
            [0, 0],
            [0, qs/2],
            [qs, qs/2]
        ])
            .move(rects[1].cx(), rects[1].y() + rects[1].height())
            .stroke({width: 2, color: "#000"}).fill('none');

        paths[2] = this._group.path([
            ['M', 0, 0],
            ['l', qs, 0],
            ['l', 0, -qs*2.3],
            ['l', cells[3].pos.x - cells[2].pos.x - qs/2.2, 0],

            ['M', 0, qs*0.2],
            ['l', qs + cells[3].pos.x - cells[2].pos.x, 0],
            ['l', 0, -qs*1.8],
            ['l', -qs/1.4, -qs],

            ['M', 0, qs*0.42],
            ['l', cells[4].pos.x - cells[2].pos.x + qs, 0],
            ['l', 0, -(rects[4].height() + qs*1.72)],
            ['l', -(cells[4].pos.x - cells[3].pos.x), 0],
        ])
            .move(rects[2].x() - rects[2].width() / 2, rects[2].y() - rects[2].height() / 2 - qs/1.2)
            .stroke({width: 2, color: "#000"}).fill('none');
    }
}

export default RelayPlate;