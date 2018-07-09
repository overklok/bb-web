import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class StripPlate extends Plate {
    static get Alias() {return "strip"}

    constructor(container, grid, id, length=1) {
        super(container, grid, id, length);

        if (length > this.__grid.dim.x) {length = this.__grid.dim.x}
        if (length > this.__grid.dim.y) {length = this.__grid.dim.y}

        this._params.extra = Number((length <= 0) ? 1 : length);
        this._params.size = {x: this._params.extra, y: 1};

        this._leds_svg = [];
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        this._bezel.fill({color: "#fffffd"}).radius(0);
        this._bezel.width(this._container.width() + this._state.cell.size.x / 4);
        this._bezel.dx(-this._state.cell.size.x / 4);

        this._error_highlighter.fill({color: "#f00"}).radius(0);
        this._error_highlighter.width(this._container.width() + this._state.cell.size.x / 4);
        this._error_highlighter.dx(-this._state.cell.size.x / 4);

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

        pl1.move(this._bezel.x() + pointer_offset_x, (this._state.cell.size.y / 2) - (ls/2));
        pl2.move(this._bezel.x() + pointer_offset_x + ls / 2, (this._state.cell.size.y / 2) - (ls/2));

        for (let i = 0; i < this._params.extra; i++) {
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