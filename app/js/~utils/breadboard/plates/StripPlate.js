import Plate from "../core/Plate";
import Cell from "../core/Cell";

class StripPlate extends Plate {
    static get Alias() {return "strip"}

    constructor(container, grid, id, length=1) {
        super(container, grid, id, length);

        if (length > this.__grid.dim.x) {length = this.__grid.dim.x}
        if (length > this.__grid.dim.y) {length = this.__grid.dim.y}

        this._params.len = (length <= 0) ? 1 : length;
        this._extra = this._params.len;

        this._cell = new Cell(0, 0, this.__grid);
        this._size = {x: this._params.len, y: 1};

        this._state = {
            highlighted: false,
        };

        this._leds_svg = [];
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    draw(position, orientation) {
        super.draw(position, orientation);

        this._bezel.fill({color: "#fffffd"});
        this._bezel.width(this._container.width() + this._cell.size.x / 4);
        this._bezel.dx(-this._cell.size.x / 4);
        this._bezel.stroke({color: "#fffffd", width: 2});

        this._drawPicture();

        // this._group.text(`Strip ${this._params.len} cells`).font({size: 26});
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
     * @param {number} ls размер лампочки / высота указателя
     * @private
     */
    _drawPicture(ls=20) {
        let pointer_offset_x = (this._group.x() - this._bezel.x()) / 2;

        let plpath = [
            [0, 0],
            [ls/2, 0],
            [ls, ls/2],
            [ls/2, ls],
            [0, ls],
            [ls/2, ls/2],
            [0, 0],
        ];

        let pl1 = this._group.polyline(plpath).fill('none').stroke({color: "#000", width: 2});
        let pl2 = this._group.polyline(plpath).fill('none').stroke({color: "#000", width: 2});

        pl1.move(this._bezel.x() + pointer_offset_x, (this._cell.size.y / 2) - (ls/2));
        pl2.move(this._bezel.x() + pointer_offset_x + ls / 2, (this._cell.size.y / 2) - (ls/2));

        for (let i = 0; i < this._params.len; i++) {
            let cell = this.__grid.cell(i, 0);

            this._group.rect(ls, ls)
                .center(
                    cell.center.x - ls / 2,
                    cell.center.y - ls / 2
                )
                .fill('#ffffff')
                .stroke({color: "#e7e7e7", width: 1})
                .attr('filter', 'url(#glow-led)');

            let led = this._group.circle(ls/1.5, ls/1.5)
                .center(
                    cell.center.x - ls / 2,
                    cell.center.y - ls / 2
                )
                .fill('#e2e2e2');

            this._leds_svg.push(led);
        }
    }
}

export default StripPlate;