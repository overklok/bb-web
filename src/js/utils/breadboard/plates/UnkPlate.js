import Plate from "../core/Plate";
import LinearPlate from "../core/plate/LinearPlate";
import BackgroundLayer from "../layers/BackgroundLayer";

export default class UnkPlate extends LinearPlate {
    static get Alias() {return "undef"}

    static get PROP_TYPE() {return 'type'}

    constructor(container, grid, schematic=false, verbose=false, id=null, props=null) {
        super(container, grid, schematic, verbose, id, props);

        this._params.size = {x: this.__length__, y: 1};

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в каждом измерении)

        this._params.rels = [];

        for (let i = 0; i < this.__length__; i++) {
            this._params.rels.push({x: i, y: 0, adj: {x: 0, y: 0}});
        }
    }

    get __defaultProps__() {
        return {
            ...super.__defaultProps__,
            [UnkPlate.PROP_TYPE]: -1
        }
    }

    /**
     * @returns {number}
     * @protected
     */
    get __length__() {
        return 1;
    }

    __setProps__(props) {
        super.__setProps__(props);

        let type = Number(props[UnkPlate.PROP_TYPE]);
        this._props[UnkPlate.PROP_TYPE] = type;
    }

    /**
     * Нарисовать перемычку
     *
     * @param {Cell}    position    положение перемычки
     * @param {string}  orientation ориентация перемычки
     */
    __draw__(position, orientation) {
        let cell = this.__grid.cell(0, 0);

        this._bezel = this._group.rect("100%", "100%").radius(BackgroundLayer.CellRadius).style({fill: '#ffbebe'});

        this._group.text(`${this._props[UnkPlate.PROP_TYPE]}`)
            .font({
                size: Plate.LabelFontSizePreferred + 6,
                family: Plate.CaptionFontFamily,
                weight: 'bold'
            })
            .center(cell.center_rel.x, cell.center_rel.y);

        this._group.circle(5).center(cell.rel.x + cell.size.x - 10, cell.rel.y + 10);
    };
}