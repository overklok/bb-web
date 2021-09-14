import SVG from 'svg.js'
import Cell from '../core/Cell';
import Grid from '../core/Grid';

import Plate, { PlateProps } from "../core/Plate";
import LinearPlate from "../core/plate/LinearPlate";
import BackgroundLayer from "../layers/BackgroundLayer";

/**
 * Unknown plate
 * 
 * @category Breadboard
 */
export default class UnkPlate extends LinearPlate {
    static get Alias() {return "undef"}

    static get PROP_TYPE() {return 'type'}

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: {} = null
    ) {
        super(container, grid, schematic, verbose, id, props);

        this._params.size = {x: this.__length__, y: 1};

        // Относительные точки плашки (координаты в стандартной ориентации)
        // Единица - размер ячейки (в каждом измерении)

        this._params.rels = [];

        for (let i = 0; i < this.__length__; i++) {
            this._params.rels.push({x: i, y: 0, adj: {x: 0, y: 0}});
        }
    }

    /**
     * @inheritdoc
     */
    protected get __defaultProps__() {
        return {
            ...super['__defaultProps__'],
            [UnkPlate.PROP_TYPE]: -1
        }
    }

    /**
     * @inheritdoc
     */
    protected get __length__() {
        return 1;
    }

    /**
     * @inheritdoc
     */
    protected __setProps__(props: PlateProps) {
        super.__setProps__(props);

        let type = Number(props[UnkPlate.PROP_TYPE]);
        this._props[UnkPlate.PROP_TYPE] = type;
    }

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        let cell = this.__grid.cell(0, 0);

        this._bezel = this._group.rect().width("100%").height("100%").radius(BackgroundLayer.CellRadius).style({fill: '#ffbebe'});

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