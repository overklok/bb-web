import Plate from "../core/Plate";
import Cell from "../core/Cell";

class ButtonPlate extends Plate {
    static get Alias() {return "button"}

    constructor(container, grid, id) {
        super(container, grid, id);

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: 2, y: 1};

        this._state = {
            highlighted: false,
        }
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._drawPicture();

        // this._group.text(`Button`).font({size: 20});
    };

    /**
     * Установить состояние перемычки
     *
     * @param {object} state новое состояние перемычки
     */
    setState(state) {
        super.setState(state);
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

        let line_gap = line_len / 6;

        this._group.path([
            ['M', 0, 0],
            ['l', line_len/2 - line_gap, 0],
            ['m', line_gap*2, 0],
            ['l', line_len/2 - line_gap, 0],
        ])
            .stroke({width: 3})
            .fill('none')
            .move(rect1.cx(), rect1.cy());

        this._group.line(
            0, 0,
            line_gap*2, 0
        )
            .stroke({width: 2, color: "#000"})
            .move(rect1.cx() + line_len/2 - line_gap, rect1.cy())
            .rotate(-25, rect1.cx() + line_len/2 - line_gap, rect1.cy());

        this._group.circle(rect1.width() / 3).center(rect1.cx() + line_len/2 - line_gap, rect1.cy());
        this._group.circle(rect1.width() / 3).center(rect1.cx() + line_len/2 + line_gap, rect1.cy());
    }
}

export default ButtonPlate;