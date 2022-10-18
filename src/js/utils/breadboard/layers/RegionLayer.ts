import SVG from "svg.js";
import Grid from "../core/Grid";

import Layer from "../core/Layer";
import { XYPoint } from "../core/extras/types";

/**
 * Highlights rectangular cell regions to point out user failures
 *
 * @category Breadboard
 * @subcategory Layers
 */
export default class RegionLayer extends Layer {
    /** CSS class of the layer */
    static get Class() {
        return "bb-layer-region";
    }

    /** layer's main SVG container */
    protected _container: SVG.Container;

    /** SVG group for highighters */
    private _regiongroup: any;

    /**
     * @inheritdoc
     */
    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        detailed: boolean = false,
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.addClass(RegionLayer.Class);

        this._regiongroup = undefined;
    }

    /**
     * @inheritdoc
     */
    public compose() {
        this._drawRegions();
    }

    /**
     * Highlight single cell region
     *
     * @param from  position of the first highlighter corner
     * @param to    position of the second highlighter corner
     * @param clear remove prevously created highighters
     * @param color color of the highlighter
     */
    public highlightRegion(from: XYPoint, to: XYPoint, clear: boolean = false, color: string = "#d40010") {
        if (clear) {
            this._regiongroup.clear();
        }

        if (!from || !to) {
            return false;
        }

        if (from.x == null || from.y == null) {
            return false;
        }
        if (to.x == null || to.y == null) {
            return false;
        }

        if (from.x >= this.__grid.dim.x || to.x >= this.__grid.dim.x) {
            throw new RangeError("X coordinate does not fit the grid's dimension");
        }

        if (from.y >= this.__grid.dim.y || to.y >= this.__grid.dim.y) {
            throw new RangeError("Y coordinate does not fit the grid's dimension");
        }

        let cell_from = this.__grid.getCell(from.x, from.y);
        let cell_to = this.__grid.getCell(to.x, to.y);

        let width = Math.abs(cell_from.pos.x - cell_to.pos.x) + cell_from.size.x + this.__grid.gap.x * 2;
        let height = Math.abs(cell_from.pos.y - cell_to.pos.y) + cell_from.size.y + this.__grid.gap.y * 2;

        this._regiongroup
            .rect(width, height)
            .move(cell_from.pos.x - this.__grid.gap.x, cell_from.pos.y - this.__grid.gap.y)
            .radius(10)
            .fill({ color: color, opacity: 0.2 })
            .stroke({ color: color, width: 2 })
            .scale(1.2)
            .animate(250, "<>", 0)
            .scale(1)
            .animate(1000)
            .fill({ opacity: 0.6 })
            .loop(100000, true);
    }

    /**
     * Remove all the highlighters created
     *
     * This action will be done automatically if a new region is added via {@link highlightRegion} by default.
     */
    public clearRegions() {
        this._regiongroup.clear();
    }

    /**
     * Initializes internal SVG group to draw highlighter elements inside
     */
    private _drawRegions() {
        this._regiongroup = this._container.group().id("regiongroup");
        // this._regiongroup.move(100, 170);
    }

    /**
     * Highlight all cells occupied by plate in the {@link Grid}
     *
     * This method might be useful when debugging plate behavior.
     */
    private _highlightOccupiedCells() {
        this._regiongroup.clear();

        for (let col of this.__grid.cells) {
            for (let cell of col) {
                if (cell.occupied) {
                    this.highlightRegion(cell.idx, cell.idx);
                }
            }
        }
    }
}
