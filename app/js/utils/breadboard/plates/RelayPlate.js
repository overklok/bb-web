import Plate from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";

export default class RelayPlate extends LinearPlate {
    static get Alias() {return "relay"}

    constructor(container, grid, schematic=false, id) {
        super(container, grid, schematic, id);
    }

    get __length__() {
        return 5;
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
    setState(state, suppress_events) {
        super.setState(state, suppress_events);
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

        let block = this._group.rect(qs*0.8, qs*1.6);
        block.center((cells[0].center_rel.x / 2) + (cells[1].center_rel.x / 2), cells[0].center_rel.y);

        block.fill({color: 'transparent'});
        block.stroke({color: 'black', width: 2});

        paths[0] = this._group.polyline([
            [cells[0].center_rel.x, cells[0].center_rel.y],
            [cells[0].center_rel.x, cells[0].center_rel.y + qs],
            [block.cx(), cells[0].center_rel.y + qs],
            [block.cx(), block.y() + block.height()]
        ])
            .stroke({width: 2, color: "#000"}).fill('none');

        paths[1] = this._group.polyline([
            [block.cx(), block.y()],
            [block.cx(), cells[1].center_rel.y - qs],
            [cells[1].center_rel.x, cells[1].center_rel.y - qs],
            [cells[1].center_rel.x, cells[1].center_rel.y],
        ])
            .stroke({width: 2, color: "#000"}).fill('none');

        let cells_32x_one_thirds = (cells[3].center_rel.x - cells[2].center_rel.x) / 3;
        let cells_32x_two_thirds = cells_32x_one_thirds * 2;

        let cells_32x_half = (cells[3].center_rel.x - cells[2].center_rel.x) / 2;

        paths[2] = this._group.polyline([
            [cells[2].center_rel.x, cells[2].center_rel.y],

            [cells[2].center_rel.x + cells_32x_one_thirds, cells[2].center_rel.y],
            [cells[2].center_rel.x + cells_32x_two_thirds, cells[3].center_rel.y - qs/2],
        ])
            .stroke({width: 2, color: "#000"}).fill('none');

        paths[3] = this._group.polyline([
            [cells[3].center_rel.x, cells[3].center_rel.y],
            [cells[3].center_rel.x, cells[3].center_rel.y + qs],
            [cells[3].center_rel.x - cells_32x_half, cells[3].center_rel.y + qs],
            [cells[3].center_rel.x - cells_32x_half, cells[3].center_rel.y + qs/2],
        ])
            .stroke({width: 2, color: "#000"}).fill('none');

        paths[4] = this._group.polyline([
            [cells[2].center_rel.x + cells_32x_half, cells[2].center_rel.y - qs/3],
            [cells[2].center_rel.x + cells_32x_half, cells[2].center_rel.y - qs],

            [cells[4].center_rel.x, cells[4].center_rel.y - qs],
            [cells[4].center_rel.x, cells[4].center_rel.y],
        ])
            .stroke({width: 2, color: "#000"}).fill('none');
    }
}