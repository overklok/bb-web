import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class TransistorPlate extends Plate {
    static get Alias() {return "transistor"}

    constructor(container, grid, schematic=false, id) {
        super(container, grid, schematic, id);

        // Размер плашки в стандартной ориентации
        this._params.size = {x: 3, y: 1};

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в кадом измерении)
        this._params.rels = [
            {x: 0, y: 0,    adj: {x: 0, y: 0}},
            {x: 1, y: 0,    adj: {x: 0, y: +1/3}},
            {x: 2, y: 0,    adj: {x: 0, y: 0}},
        ];

        // Подгонка позиции плашки для каждой ориентации
        // Единица - размер ячейки (в кадом измерении)
        this._params.adjs = {};
        this._params.adjs[Plate.Orientations.North] = {x: 0, y: 0};
        this._params.adjs[Plate.Orientations.South] = {x: 0, y: 0};
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
    setState(state, suppress_events) {
        super.setState(state, suppress_events);
    }

    /**
     *
     * @param {number} qs размер квадратов
     * @private
     */
    _drawPicture(qs=Plate.QuadSizeDefault) {
        let cell1 = this.__grid.cell(0, 0);
        let cell2 = this.__grid.cell(1, 0);
        let cell3 = this.__grid.cell(2, 0);

        // line_top_width
        let ltw = 2;

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);
        let rect3 = this._group.rect(qs, qs);

        rect1.cx(cell1.center_rel.x).cy(cell1.center_rel.y);
        rect2.cx(cell2.center_rel.x).cy(cell2.center_rel.y + qs/2);
        rect3.cx(cell3.center_rel.x).cy(cell3.center_rel.y);

        let line_len = rect3.x() - rect1.x() - qs*2;

        let line_gap = line_len / 8;

        let line_top_1 = this._group.path([
            ['M', cell1.center_rel.x, cell1.center_rel.y],
            ['l', qs, -qs],
            ['l', line_len/2 - line_gap, 0],
            ['l', qs/2, qs/2],
        ])
            .stroke({width: ltw})
            .fill('none');

        let line_top_2 = this._group.path([
            ['M', cell3.center_rel.x, cell3.center_rel.y],
            ['l', -qs, -qs],
            ['l', -(line_len/2 - line_gap), 0],
            ['l', -qs/2, qs/2],
        ])
            .stroke({width: ltw})
            .fill('none');

        let line_center = this._group.path([
            ['M', 0, 0],
            ['l', line_gap*4, 0],
            ['M', line_gap*4/2, 0],
            ['l', 0, qs/2],
        ])
            .stroke({width: ltw, color: "#000"})
            .fill('none')
            .x(cell2.center_rel.x - line_gap * 2)
            .y(cell1.center_rel.y - qs/2);

        this._group.polyline([
                [0, 0],
                [qs/2, 0],
                [qs/4, -qs/3],
                [0, 0],
            ])
            .fill('#000')
            .move(cell2.rel.x + cell2.size.x / 2 + qs/3, cell2.center_rel.y - qs)
            .rotate(45);

        // this._group.line([
        //     ['M', 0, 0],
        //     ['l', line_gap/2, -line_gap/2.2],
        //     ['l', line_gap/4, line_gap/1.5],
        //     ['l', -line_gap/1.35, -line_gap/4],
        // ])
        //     .stroke({width: 1, color: "#000"})
        //     .fill('#000')
        //     .move(rect1.cx() + line_gap*3.2, rect1.cy() + qs/3.6);
        //
        // let line_connector = this._group.polyline([
        //     [0, 0],
        //     [0, qs/1.5],
        //     [qs/2, qs],
        //     [line_gap, qs]
        // ])
        //     .stroke({width: 3})
        //     .fill('none')
        //     .move(rect3.cx(), rect3.cy())
        //     .scale(-1, 1).x(rect3.cx() + line_gap)
    }
}