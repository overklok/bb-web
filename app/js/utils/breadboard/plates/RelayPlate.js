import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class RelayPlate extends Plate {
    static get Alias() {return "relay"}

    constructor(container, grid, schematic=false, id) {
        super(container, grid, schematic, id);

        this._params.size = {x: 5, y: 1};
    }

    /**
     * Нарисовать реле
     *
     * @param {Cell}    position    положение реле
     * @param {string}  orientation ориентация реле
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Resistor ${this._params.resistance} Ohm`).font({size: 20});
    };

    /**
     * Установить состояние реле
     *
     * @param {object} state новое состояние реле
     */
    setState(state) {
        super.setState(state);
    }

    /**
     * Переместить реле
     *
     * @param {int} dx смещение реле по оси X
     * @param {int} dy смещение реле по оси Y
     */
    shift(dx, dy) {
        super.shift(dx, dy);
    }

    /**
     * Повернуть реле
     *
     * @param {string} orientation ориентация реле
     */
    rotate(orientation) {
        super.rotate(orientation);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizeDefault) {
        let cells = [];
        let rects = [];
        let paths = [];

        for (let i = 0; i < 5; i++) {
            let cell = this.__grid.cell(i, 0);

            let rect = this._group.rect(qs, qs);

            rect.center(cell.center_rel.x, cell.center_rel.y);

            cells.push(cell);
            rects.push(rect);
        }

        paths[0] = this._group.polyline([
            [cells[0].center_rel.x, cells[0].center_rel.y],
            [cells[0].center_rel.x, qs/2],
            [cells[1].rel.x - cells[0].rel.x + qs, qs/2]
        ])
            .stroke({width: 2, color: "#000"}).fill('none');

        paths[1] = this._group.polyline([
            [0, 0],
            [0, qs/2],
            [qs, qs/2]
        ])
            .move(rects[1].cx(), rects[1].y() + rects[1].height())
            .stroke({width: 2, color: "#000"}).fill('none');

        let p2_pos = {
            x: rects[2].x() - rects[2].width() / 2,
            y: rects[2].y() + qs*1.2
        };

        paths[2] = this._group.path([
            ['M', p2_pos.x, p2_pos.y],
            ['l', qs, 0],
            ['l', 0, -(rects[4].height() + qs*0.6)],
            ['l', cells[3].rel.x - cells[2].rel.x - qs/2.2, 0],

            ['M', p2_pos.x, p2_pos.y + qs*0.2],
            ['l', qs + cells[3].rel.x - cells[2].rel.x, 0],
            ['l', 0, -qs*1.7],
            ['l', -qs/3, -qs/3],

            ['M', p2_pos.x, p2_pos.y + qs*0.42],
            ['l', cells[4].rel.x - cells[2].rel.x + qs, 0],
            ['l', 0, -(rects[4].height() + qs*1.05)],
            ['l', -(cells[4].rel.x - cells[3].rel.x) + qs/2, 0],
        ])
            .stroke({width: 2, color: "#000"}).fill('none');
    }
}