import SVG from "svg.js";
import Grid, { AuxPoint, AuxPointCategory, AuxPointType } from "../core/Grid";

import Layer from "../core/Layer";
import { CellRole, VoltageTable, XYPoint } from "../core/extras/types";
import { hsvToRgb } from "../core/extras/helpers";
import { getSourceLinePath } from "../core/extras/helpers_svg";
import VoltagePopup, { VoltagePopupContent } from "../popups/VoltagePopup";

/**
 * Highlights rectangular cell regions to point out user failures
 *
 * @category Breadboard
 * @subcategory Layers
 */
export default class VoltageLayer extends Layer {
    /** CSS class of the layer */
    static get Class() {
        return "bb-layer-voltage";
    }

    /** layer's main SVG container */
    protected _container: SVG.Container;

    /** SVG group for hover zones */
    private _hovergroup: any;

    /** Hoverable SVG elements */
    private _zones: { [zone_id: string]: SVG.Element };

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
        this._zones = {};

        this._hovergroup = this._container.group().id("hovergroup");

        this._drawHoverZones();
        this._drawAuxHoverZoneSource();

        this._attachEventHandlers();
    }

    public setLineVoltages(voltages: VoltageTable) {
        for (const [line_id, voltage] of Object.entries(voltages)) {
            this._popups[line_id].updateContent({ voltage });

            if (this.__grid.lines[line_id].role === CellRole.Minus) {
                this._popups.gnd.updateContent({ voltage });
            }

            if (this.__grid.lines[line_id].role === CellRole.Plus) {
                this._popups.vcc.updateContent({ voltage });
            }
        }
    }

    private _attachEventHandlers() {
        for (const [line_id, zone] of Object.entries(this._zones)) {
            const popup = this._popups[line_id];

            zone.on("mouseenter", () => {
                this._requestPopupShow(popup);
            });
            zone.on("mouseleave", () => {
                this._requestPopupHide(popup);
            });
        }
    }

    private _drawHoverZones() {
        for (const [l_id, line] of Object.entries(this.__grid.lines)) {
            // const d_id = Number(l_id.split(".")[0].replace(/[a-zA-Z]/g, ""));

            const { from, to } = line.field;

            // const rgb = hsvToRgb(
            //     Number(d_id) / Object.keys(this.__grid.domains).length,
            //     1,
            //     1
            // );

            this._zones[l_id] = this._drawZone(from, to, "#f00");
            this._popups[l_id] = this._createPopup(l_id);
        }
    }

    private _drawAuxHoverZoneSource() {
        if (
            !this.__grid.isAuxPointCatRequired(AuxPointCategory.SourceV5) &&
            !this.__grid.isAuxPointCatRequired(AuxPointCategory.SourceV8)
        ) {
            return;
        }

        const p_gnd = this.__grid.auxPoint(AuxPointType.Gnd) as AuxPoint;
        const p_vcc = this.__grid.auxPoint(AuxPointType.Vcc) as AuxPoint;

        // Top/bottom bias (detailed schematic view only)
        let bias = this.__schematic && this.__detailed && 20;

        const [path_gnd, path_vcc] = getSourceLinePath(p_gnd, p_vcc, bias);

        // Voltage source line, actually
        const el_gnd = this._hovergroup.path(path_gnd);
        const el_vcc = this._hovergroup.path(path_vcc);

        for (const el of [el_vcc, el_gnd]) {
            el.fill({ color: "none" })
                .stroke({ color: "#f00", width: 30 })
                .opacity(0);
        }

        this._zones.gnd = el_gnd;
        this._zones.vcc = el_vcc;

        this._popups.gnd = this._createPopup("gnd");
        this._popups.vcc = this._createPopup("vcc");
    }

    /**
     * Highlights single cell region
     *
     * @param from  position of the first highlighter corner
     * @param to    position of the second highlighter corner
     * @param clear remove prevously created highighters
     * @param color color of the highlighter
     */
    private _drawZone(
        from: XYPoint,
        to: XYPoint,
        color: string = "#d40010"
    ): SVG.Element {
        if (!from || !to) {
            throw new Error("From/to is not defined");
        }

        if (from.x == null || from.y == null || to.x == null || to.y == null) {
            throw new Error("X/Y is not defined");
        }

        if (from.x >= this.__grid.dim.x || to.x >= this.__grid.dim.x) {
            throw new RangeError(
                "X coordinate does not fit the grid's dimension"
            );
        }

        if (from.y >= this.__grid.dim.y || to.y >= this.__grid.dim.y) {
            throw new RangeError(
                "Y coordinate does not fit the grid's dimension"
            );
        }

        let cell_from = this.__grid.getCell(from.x, from.y);
        let cell_to = this.__grid.getCell(to.x, to.y);

        let width =
            Math.abs(cell_from.pos.x - cell_to.pos.x) +
            cell_from.size.x +
            this.__grid.gap.x * 2;
        let height =
            Math.abs(cell_from.pos.y - cell_to.pos.y) +
            cell_from.size.y +
            this.__grid.gap.y * 2;

        const rect = this._hovergroup.rect(width, height);

        rect.move(
            cell_from.pos.x - this.__grid.gap.x,
            cell_from.pos.y - this.__grid.gap.y
        ).fill({ color: color });
        // .stroke({ color: color, width: 2 });
        rect.opacity(0);

        return rect;
    }

    private _createPopup(line_id: string): VoltagePopup {
        const popup = new VoltagePopup(line_id);
        this._requestPopupDraw(popup, { voltage: 0 });

        return popup;
    }
}
