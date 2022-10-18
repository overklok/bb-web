import SVG from "svg.js";

import Plate, { PlateProps, PlateState } from "../core/Plate";
import { mod } from "~/js/utils/breadboard/core/extras/helpers";
import Grid from "../core/Grid";
import Cell from "../core/Cell";

/**
 * Rheostat plate
 *
 * @category Breadboard
 * @subcategory Plates
 */
export default class RheostatPlate extends Plate {
    static get Alias() {
        return "rheostat";
    }

    private _svginp: SVG.Text;

    private _svginpbg: SVG.Rect;

    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        verbose: boolean = false,
        id: number = null,
        props: PlateProps = null
    ) {
        super(container, grid, schematic, verbose, id, props);

        this._params.size = { x: 3, y: 2 };

        this._params.surface = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 }
        ];

        this._params.origin = { x: 0, y: 0 };

        this._state.input = 0;
    }

    public get input() {
        return Number(this._state.input);
    }

    /**
     * @inheritdoc
     */
    public inputIncrement() {
        this.setState({ input: mod(Number(this.input) + 1, 256) });
    }

    /**
     * @inheritdoc
     */
    public inputDecrement() {
        this.setState({ input: mod(Number(this.input) - 1, 256) });
    }

    /**
     * @inheritdoc
     */
    public setState(
        state: Partial<PlateState>,
        suppress_events: boolean = false
    ) {
        if (state.input === undefined) return;

        let input = state.input || 0;

        input = Math.min(Math.max(input, 0), 255);

        super.setState({ input }, suppress_events);

        if (this._params.verbose) {
            this._redrawInput(state.input);
        }
    }

    /**
     * @inheritdoc
     */
    protected __draw__(position: Cell, orientation: string) {
        this._drawPicture();

        if (this._params.verbose) {
            this._redrawInput(this._state.input);
        }

        // this._group.text(`Resistor ${this._params.resistance} Ohm`).font({size: 20});
    }

    /**
     * Updates debug input value indicator
     *
     * @param input_value value to display
     */
    private _redrawInput(input_value: string) {
        if (!this._svginp) {
            this._svginpbg = this._container.rect(0, 0).style({ fill: "#000" });

            this._svginp = this._container
                .text("-")
                .center(0, 0)
                .style({ fill: "#0F0" })
                .font({ size: 22 });
        }

        this._svginp.style({
            fill: input_value === undefined ? "#F00" : "#0F0"
        });
        this._svginp.text(
            input_value === undefined ? "n/a" : String(input_value)
        );

        const { x, y, width, height } = (
            this._svginp.node as unknown as SVGGraphicsElement
        ).getBBox();

        this._svginpbg.size(width, height).move(x, y);
    }

    /**
     * Draws a rheostat over the plate surface
     *
     * @param qs size of squares
     */
    private _drawPicture(qs = Plate.QuadSizePreferred) {
        let cell1 = this.__grid.getCell(0, 0);
        let cell2 = this.__grid.getCell(2, 0);
        let cell3 = this.__grid.getCell(1, 1);

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
            ["M", cell1.center_rel.x, cell1.center_rel.y],
            ["H", cell3.rel.x],
            ["L", contact_point.x, contact_point.y]
        ]);

        let line_left = this._group.path([
            ["M", cell2.center_rel.x, cell2.center_rel.y],
            ["H", cell3.rel.x + cell3.size.x],
            ["L", contact_point.x, contact_point.y]
        ]);

        let line_middle = this._group.path([
            ["M", cell3.center_rel.x, cell3.center_rel.y],
            ["V", contact_point.y + qs / 2]
        ]);

        line_right.stroke({ width: 3 }).fill("none");
        line_left.stroke({ width: 3 }).fill("none");
        line_middle.stroke({ width: 3 }).fill("none");

        let body = this._group
            .rect(qs * 2, qs / 1.5)
            .stroke({ width: 3 })
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

        line_middle.marker("end", qs / 2, qs / 2, function (add) {
            add.path([
                ["M", 0, 0],
                ["l", -qs / 2, -qs / 4],
                ["l", 0, qs / 2],
                ["l", qs / 2, -qs / 4]
            ])
                .fill("#000")
                .stroke({ width: 0.5 })
                .move(-qs / 4, 0);
        });
    }
}
