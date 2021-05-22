import Plate from "../core/Plate";
import Cell from "../core/Cell";

export default class RGBPlate extends Plate {
    static get Alias() {return "rgb"}

    constructor(container, grid, schematic=false, verbose=false, id=null, props=null) {
        super(container, grid, false, verbose, id, props);

        this._params.size = {x: 4, y: 1};
    }

    /**
     * Нарисовать RGB-диод
     *
     * @param {Cell}    position        положение RGB-диода
     * @param {string}  orientation     ориентация RGB-диода
     */
    __draw__(position, orientation) {
        this._drawPicture();
        this._drawLabel();
    };

    /**
     *
     * @param {number} ls размер светодиода
     * @private
     */
    _drawPicture(ls=Plate.LEDSizePreferred) {
        let cells = [
            this.__grid.cell(0, 0),
            this.__grid.cell(1, 0),
            this.__grid.cell(2, 0),
            this.__grid.cell(3, 0)
        ];

        let cell1 = cells[0]
        let cell2 = cells[cells.length - 1];

        let center_x = cell1.center_rel.x + (cell2.pos.x - cell1.pos.x) / 2;
        let center_y = cell1.center_rel.y;

        this._group.rect(ls, ls)
            .center(
                center_x,
                center_y
            )
            .fill('#ffffff')
            .stroke({color: "#e7e7e7", width: 1})
            .attr('filter', 'url(#glow-led)');

        this._group.circle(ls/1.5, ls/1.5)
            .center(
                center_x,
                center_y
            )
            .fill('#e2e2e2');

        for (const cell of cells) {
            this._group.circle(ls/1.5, ls/1.5)
                .center(
                    cell.center_rel.x,
                    cell.center_rel.y
                )
                .fill('#1f1f1f')
                .stroke({color: '#e7e7e7', width: 1})
        }
    }

    _drawLabel(size=Plate.LabelFontSizePreferred) {
        let cells = [
            this.__grid.cell(0, 0),
            this.__grid.cell(1, 0),
            this.__grid.cell(2, 0),
            this.__grid.cell(3, 0)
        ];

        if (this.props[Plate.PROP_INVERTED] === 1) {
            cells = cells.reverse();
        }

        this._group.text("R")
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight, anchor: "center"})
            .center(cells[0].center_rel.x, cells[0].rel.y + cells[0].size.y - size / 1.5);

        this._group.text("G")
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight, anchor: "center"})
            .center(cells[1].center_rel.x, cells[1].rel.y + cells[1].size.y - size / 1.5);

        this._group.text("B")
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight, anchor: "center"})
            .center(cells[2].center_rel.x, cells[2].rel.y + cells[2].size.y - size / 1.5);

        this._group.text("gnd")
            .font({size: size, family: Plate.CaptionFontFamily, weight: Plate.CaptionFontWeight, anchor: "center"})
            .center(cells[3].center_rel.x, cells[3].rel.y + cells[3].size.y - size / 1.5);

        // gnd.dy(-gnd.node)

        /**
        label.x(this._container.width())
            .y(this._container.height() - size)
            .stroke({width: 0.5});
         */
    }
}