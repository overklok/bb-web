import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class RheostatPlate extends Plate {
    static get Alias() {return "rheostat"}

    constructor(container, grid, schematic=false, verbose=false, id) {
        super(container, grid, schematic, verbose, id);

        this._params.size = {x: 3, y: 2};

        this._params.surface = [
            {x: 0, y: 0},   {x: 1, y: 0},   {x: 2, y: 0},
                            {x: 1, y: 1}
        ];

        this._params.origin = {x: 0, y: 0};

    }

    /**
     * Нарисовать резистор
     *
     * @param {Cell}   position    положение резистора
     * @param {string}  orientation ориентация резистора
     */
    __draw__(position, orientation) {
        this._drawPicture();

        if (this._params.verbose) {
            this._redrawInput(this._state.input);
        }

        // this._group.text(`Resistor ${this._params.resistance} Ohm`).font({size: 20});
    };

    /**
     * Установить состояние резистора
     *
     * @param {object} state    новое состояние резистора
     * @param suppress_events   глушить вызов событий
     */
    setState(state, suppress_events) {
        super.setState(state, suppress_events);

        if (state.input === undefined) return;

        if (this._params.verbose) {
            this._redrawInput(state.input);
        }
    }

    get input() {
        return Number(this._state.input);
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

    _redrawInput(input_value) {
        if (!this._svginp) {
            let cell = this.__grid.cell(0, 0);
            this._svginp = this._container.text('0')
                .center(cell.center_rel.x, cell.center_rel.y)
                .style({fill: '#0F0'})
                .font({size: 22});
        }

        this._svginp.text(String(input_value));
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizePreferred) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(2, 0);
        let cell3 = this.__grid.cell(1, 1);

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);
        let rect3 = this._group.rect(qs, qs);

        rect1.cx(cell1.center_rel.x).cy(cell1.center_rel.y);
        rect2.cx(cell2.center_rel.x).cy(cell2.center_rel.y);
        rect3.cx(cell3.center_rel.x).cy(cell3.center_rel.y);

        let contact_point = {
            x: cell3.center_rel.x,
            y: cell1.center_rel.y
        };

        let line_right = this._group.path([
            ['M', cell1.center_rel.x, cell1.center_rel.y],
            ['H', cell3.rel.x],
            ['L', contact_point.x, contact_point.y],
        ]);

        let line_left = this._group.path([
            ['M', cell2.center_rel.x, cell2.center_rel.y],
            ['H', cell3.rel.x + cell3.size.x],
            ['L', contact_point.x, contact_point.y],
        ]);

        let line_middle = this._group.path([
            ['M', cell3.center_rel.x, cell3.center_rel.y],
            ['V', contact_point.y + qs / 2]
        ]);

        line_right.stroke({width: 3}).fill('none');
        line_left.stroke({width: 3}).fill('none');
        line_middle.stroke({width: 3}).fill('none');

        let body = this._group.rect(qs * 2, qs / 1.5)
            .stroke({width: 3})
            .fill("#fffffd")
            .center(contact_point.x, cell1.center_rel.y);

        // let arrow_height = qs * 1.5;
        // let arrow_width = qs * 2;
        //
        // let arrow = this._group.polyline([
        //     [arrow_width, -arrow_height],
        //     [0, -arrow_height],
        //     [0, 0],
        // ])
        //     .stroke({width: 3})
        //     .fill("none")
        //     .x(body.cx())
        //     .y(body.y() - arrow_height);

        line_middle.marker('end', qs/2, qs/2, function(add) {
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