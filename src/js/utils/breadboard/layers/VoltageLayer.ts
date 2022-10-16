import SVG from "svg.js";
import Grid from "../core/Grid";

import Layer from "../core/Layer";
import { XYObject } from "../core/types";

type VoltageConfig = {[line_id: number]: XYObject[]};

/**
 * Highlights rectangular cell regions to point out user failures
 * 
 * @category Breadboard
 * @subcategory Layers
 */
export default class VoltageLayer extends Layer {
    /** CSS class of the layer */
    static get Class() {return "bb-layer-domain"}

    /** layer's main SVG container */
    protected _container: SVG.Container;

    /** SVG group for hover zones */
    private _hovergroup: any;

    private _hover_zones: SVG.Element[];

    /** Line-cell mapping */
    private _voltage_lines: VoltageConfig;

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

        this._container.addClass(VoltageLayer.Class);

        this._hovergroup = undefined;
    }

    /**
     * @inheritdoc
     */
    public compose() {
        // this._drawHoverZones();
    }

    public setConfig(voltage_lines: VoltageConfig) {
        this._voltage_lines = voltage_lines;
    }

    private _drawHoverZones() {
        for (const [line_id, cells] of Object.entries(this._voltage_lines)) {

        }
    }

    /**
     * Highlight single cell region
     * 
     * @param from  position of the first highlighter corner
     * @param to    position of the second highlighter corner
     * @param clear remove prevously created highighters
     * @param color color of the highlighter
     */
    private _drawHoverZone(from: XYObject, to: XYObject) {
        if (!from || !to) {return false}

        if (from.x == null || from.y == null) {return false}
        if (to.x == null || to.y == null) {return false}

        if (from.x >= this.__grid.dim.x || to.x >= this.__grid.dim.x) {
            throw new RangeError("X coordinate does not fit the grid's dimension");
        }

        if (from.y >= this.__grid.dim.y || to.y >= this.__grid.dim.y) {
            throw new RangeError("Y coordinate does not fit the grid's dimension");
        }

        let cell_from = this.__grid.cell(from.x, from.y);
        let cell_to = this.__grid.cell(to.x, to.y);

        let width = Math.abs(cell_from.pos.x - cell_to.pos.x) + cell_from.size.x + this.__grid.gap.x * 2;
        let height = Math.abs(cell_from.pos.y - cell_to.pos.y) + cell_from.size.y + this.__grid.gap.y * 2;

        this._hovergroup
            .rect(width, height)
            .move(cell_from.pos.x - this.__grid.gap.x, cell_from.pos.y - this.__grid.gap.y)
            .radius(10)
            .fill({color: 'red', opacity: 0.2})
            .stroke({color: 'red', width: 2})
            .scale(1.2)
            .animate(250, '<>', 0).scale(1)
            .animate(1000).fill({opacity: 0.6}).loop(100000, true);
    }

    /**
     * Remove all the highlighters created
     * 
     * This action will be done automatically if a new region is added via {@link highlightRegion} by default.
     */
    public clearRegions() {
        this._hovergroup.clear();
    }

    /** 
     * Initializes internal SVG group to draw highlighter elements inside
     */
    private _drawRegions() {
        this._hovergroup = this._container.group().id("regiongroup");
        // this._regiongroup.move(100, 170);
    }

    private _getVoltageLineByCoords(coords: XYObject): number {
        // get Cell instance just to throw an error if it doesn't exist
        const cell = this.__grid.cell(coords.x, coords.y);
        coords = cell.idx;

        const key = Object.keys(this._voltage_lines).find(
            (line_id) => this._voltage_lines[Number(line_id)].find(
                _cell => (_cell.x === coords.x && _cell.y === coords.y)
            )
        );
    
        return key ? Number(key) : undefined;
    }

}