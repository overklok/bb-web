import SVG from "svg.js";

import Plate, { PlateProps } from "../core/Plate";
import Cell from "../core/Cell";
import LinearPlate from "../core/plate/LinearPlate";
import Grid from "../core/Grid";

/**
 * Capacitor plate
 *
 * @category Breadboard
 * @subcategory Plates
 */
export default class CapacitorPlate extends LinearPlate {
    static get Alias() {
        return "capacitor";
    }

    static get PROP_CAPACITANCE() {
        return "cap";
    }

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, schematic, verbose, id, props);
    }

    public get variant() {
        return this._shortLabel() + "Ф";
    }

    /**
     * @inheritdoc
     */
    protected get __defaultProps__() {
        return {
            ...super["__defaultProps__"],
            [CapacitorPlate.PROP_CAPACITANCE]: 0.001
        };
    }

    protected __setProps__(props: PlateProps) {
        super.__setProps__(props);

        this._props[CapacitorPlate.PROP_CAPACITANCE] = Number(
            this._props[CapacitorPlate.PROP_CAPACITANCE]
        );
    }

    /**
     * @inheritdoc
     */
    __draw__(position: Cell, orientation: string) {
        this._drawPicture();

        this._drawLabel();
    }

    /**
     * Draws a capacitor over the plate surface
     *
     * @param qs size of squares
     */
    private _drawPicture(qs = Plate.QuadSizePreferred) {
        let cell1 = this.__grid.getCell(0, 0);
        let cell2 = this.__grid.getCell(
            this._params.size.x - 1,
            this._params.size.y - 1
        );

        let rect1 = this._group.rect(qs, qs);
        let rect2 = this._group.rect(qs, qs);

        rect1.center(cell1.center_rel.x, cell1.center_rel.y);
        rect2.center(cell2.center_rel.x, cell2.center_rel.y);

        let line_len = rect2.x() - rect1.x();

        this._group
            .path([
                ["M", 0, 0],
                ["l", line_len / 2 - qs / 4, 0],
                ["m", qs / 2, 0],
                ["l", line_len / 2 - (qs * 2) / 4, 0]
            ])
            .stroke({ width: 1 })
            .fill("none")
            .move(rect1.cx(), rect2.cy());

        let line1 = this._group
            .line(0, 0, 0, qs * 1.5)
            .stroke({ width: 1 })
            .x(rect1.x() + line_len / 2 + qs / 4)
            .cy(rect1.cy());
        let line2 = this._group
            .line(0, 0, 0, qs * 1.5)
            .stroke({ width: 1 })
            .x(rect2.x() - line_len / 2 + (qs * 3) / 4)
            .cy(rect2.cy());

        this._group.text("+").move(line2.x() + 4, line2.y() - 8);
    }

    /**
     * Draws a label with the capacitor designation
     *
     * @param size label font size
     */
    private _drawLabel(size = Plate.LabelFontSizePreferred) {
        this._group
            .text(this._shortLabel() + "Ф")
            .font({
                size: size,
                family: Plate.CaptionFontFamily,
                weight: Plate.CaptionFontWeight
            })
            .cx(this._container.width() / 2)
            .y(this._container.height() - size - 2)
            .stroke({ width: 0.5 });
    }

    /**
     * @returns short designtation of the capacitor
     */
    private _shortLabel(): string {
        let text = String(this._props[CapacitorPlate.PROP_CAPACITANCE]);

        let num = Number(text);

        if (num * 1e6 >= 1) {
            text = String(Number(num * 1e6).toPrecision()) + "мк";
        }
        // if (num * 1e3 >= 1)    {text = String(Number(num * 1e3).toPrecision())   + 'н'}
        if (num >= 1) {
            text = String(Number(num).toPrecision()) + "пк";
        }

        return text;
    }
}
