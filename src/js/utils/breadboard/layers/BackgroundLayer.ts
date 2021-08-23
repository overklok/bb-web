import SVG from "svg.js";

import Layer from "../core/Layer";
import Plate from "../core/Plate";
import Grid, { AuxPointCategory, BorderType, AuxPoint, AuxPointType } from "../core/Grid";
import Cell from "../core/Cell";

import {GRADIENTS} from "../styles/gradients";
import {getCursorPoint} from "../core/extras/helpers";
import { Domain } from "../core/types";

export const enum DomainSchematicStyle {
    Default = 'default',
    Dotted = 'dotted',
    None = 'none'
}

/**
 * The lowest {@link Layer} of the {@link Breadboard} to display.
 * 
 * Contains background canvas and some visual details such as:
 *  - mount points (cells) and their contact groups (domains)
 *  - voltage source element
 *  - usb contact lines
 *  - debug information (cursor positioning feedback)
 * 
 * This layer has two styles: schematic (default) and photographic (which is obsolete).
 *  
 * The _cell_ is a point at which a plate can be mounted. Each plate occupies at least one cell at the moment.
 * The _domain_ (or contact group) is the group of interconnected cells. 
 * 
 * Connected cells creates a contact so current can flow through it.
 * To connect cells from different groups, you need a {@link Plate} mounted on cells from each of the groups,
 * and this {@link Plate} should be able to pass current through itself (which depends on its type).
 * This is why it's needed to visually display the contact groups.
 */
export default class BackgroundLayer extends Layer {
    /** CSS class of the layer */
    static Class = "bb-layer-background";

    /** the radius of the cell point (which is virtually a circle) */
    static CellRadius = 5;

    /** an offset of domain lines relative to cell positions in schematic mode */
    static DomainSchematicBias = 20;

    /** topology configuration of the specific breadboard */
    private _domain_config: Domain[];

    /** whether to display debug information */
    private _debug: boolean;

    /** SVG group for the main background */
    private _boardgroup: SVG.Container;
    /** SVG group for domain lines */
    private _domaingroup: SVG.Container;
    /** SVG group for cells  */
    private _currentgroup: SVG.Container;
    /** SVG group for decorative elements (such as voltage source lines and poles) */
    private _decogroup: SVG.Container;

    /** SVG cells (2D)  */
    private _gcells: any[];

    /** SVG cells to display when hovered (2D) in debug mode */
    private _gcells_hovered: any[];
    /** SVG cell which has been hovered last time */
    private _cell_last_hovered: any;
    /** SVG text which is displayed in debug mode */
    private _debug_text: any;
    /** current position of the client cursor */
    private _hover_pos: { x: number; y: number; };
    /** whether another animation frame is scheduled */
    private _scheduled_animation_frame: boolean;

    constructor(
        container: SVG.Container, 
        grid: Grid, 
        schematic: boolean = false, 
        detailed: boolean = false, 
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.addClass(BackgroundLayer.Class);

        this._boardgroup    = undefined;

        this._domaingroup   = undefined;
        this._currentgroup  = undefined;
        this._decogroup     = undefined;

        this._domain_config = undefined;

        this._debug = verbose;
        this._gcells = [];
        this._gcells_hovered = [];
        this._cell_last_hovered = undefined;
        this._debug_text = undefined;

        this._initGroups();
    }

    /**
     * Sets the board topology required to display cells and contacts
     * 
     * The method is expected to be called before the {@link compose} is called
     * 
     * @param domain_config 
     */
    public setDomainConfig(domain_config: Domain[]) {
        this._domain_config = domain_config;
    }

    /**
     * Draws contents for the layer
     */
    public compose() {
        this._boardgroup
            .rect().width('99%').height('99%') /// 99 из-за обрезания рамки
            .radius(20)
            .fill({color: "#f9f9f9"})
            .stroke({color: "#c9c9c9", width: 4})
            .move(4, 4);

        if (this._debug) {
            this._debug_text = this._boardgroup
                .text('debug mode enabled')
                .move('100%', 0)
                .font({family: Plate.CaptionFontFamily, anchor: 'end'})
                .fill('magenta');
        }

        this._drawAuxPoints();
        this._drawDomains();
        this._drawCells();
    }

    /**
     * @inheritdoc
     */
    public recompose(schematic: boolean, detailed: boolean, verbose: boolean) {
        super.recompose(schematic, detailed);

        this._debug = verbose;

        this._initGroups();
        this.compose();
    }


    /**
     * Initializes internal SVG groups of the layer
     * 
     * Removes previously created groups and re-attaches event handlers
     */
    private _initGroups() {
        this._clearGroups();

        this._boardgroup    = this._container.group();
        this._domaingroup   = this._container.group();
        this._currentgroup  = this._container.group();
        this._decogroup     = this._container.group();

        this._attachHandlers();
    }

    /** 
     * Removes SVG groups created previously with {@link _initGroups}
     */
    private _clearGroups() {
        if (this._boardgroup)   this._boardgroup.remove();
        if (this._domaingroup)  this._domaingroup.remove();
        if (this._currentgroup) this._currentgroup.remove();
        if (this._decogroup)    this._decogroup.remove();
    }

    /**
     * Attaches event handlers for mouse movement to highlight hovered cells
     */
    private _attachHandlers() {
        if (!this._debug) return;

        this._gcells_hovered = [];
        this._cell_last_hovered = undefined;

        this._boardgroup.on('mousemove', (evt: MouseEvent) => {
            this._hover_pos = {x: evt.clientX, y: evt.clientY};

            if (this._scheduled_animation_frame) return;

            requestAnimationFrame(this._hoverCell.bind(this));

            this._scheduled_animation_frame = true;
        });
    }

    /**
     * Handles cell hovers (debug-only)
     */
    private _hoverCell() {
        this._scheduled_animation_frame = false;

        const svg_main = this._container.node as unknown as SVGSVGElement;
        const cursor_point = getCursorPoint(svg_main, this._hover_pos.x, this._hover_pos.y);

        const cell = this.__grid.getCellByPos(cursor_point.x, cursor_point.y);

        let last_idx;

        if (this._cell_last_hovered) {
            last_idx = this._cell_last_hovered.idx;
        }

        if (!last_idx || cell.idx.x !== last_idx.x || cell.idx.y !== last_idx.y) {
            if (cell.idx.x in this._gcells && cell.idx.y in this._gcells[cell.idx.x]) {
                const gcell = this._gcells[cell.idx.x][cell.idx.y];
                gcell.stop(true, true);
                gcell.stroke({color: 'magenta', width: 5});

                this._gcells_hovered.push({x: cell.idx.x, y: cell.idx.y, gcell});
                this._cell_last_hovered = cell;

                this._debug_text.text(`x: ${cell.idx.x}, y: ${cell.idx.y}`);
            }
        }

        for (const [idx, {x, y, gcell}] of this._gcells_hovered.entries()) {
            if (gcell == null) continue;

            if (x === cell.idx.x && y === cell.idx.y) continue;

            gcell.stroke({color: null, width: 0});
            this._gcells_hovered.splice(0, idx)
        }
    }

    /**
     * Draws auxiliary points (special points which fall outside the regular grid)
     */
    private _drawAuxPoints() {
        this._drawAuxPointSource();
        this._drawAuxPointUsbs();
    }

    /** Draws cells (points of the regular grid) */
    private _drawCells() {
        this._gcells = [];

        for (let col of this.__grid.cells) {
            for (let cell of col) {
                this._drawCell(this._currentgroup, cell);
            }
        }
    }

    /**
     * Draws cell domains (contact lines which groups the cells into the "domains", 
     * see {@link BackgroundLayer})
     */
    private _drawDomains() {
        if (!this._domain_config) return;

        for (const domain of this._domain_config) {
            let d_from  = this.__grid.cell(domain.from.x, domain.from.y, BorderType.Wrap).idx,
                d_to    = this.__grid.cell(domain.to.x, domain.to.y, BorderType.Wrap).idx;

            if (domain.style === DomainSchematicStyle.None) continue;

            if (domain.horz) {
                if (d_from.x > d_to.x) [d_from, d_to] = [d_to, d_from];

                for (let row = d_from.y; row <= d_to.y; row++) {
                    this._drawDomain(
                        this._domaingroup,
                        this.__grid.cell(d_from.x, row),
                        this.__grid.cell(d_to.x, row),
                        this.__schematic ? '#777' : GRADIENTS.GOLD.HORZ,
                        domain.style === DomainSchematicStyle.Dotted,
                        !!domain.bias_inv,
                        domain.line_after,
                        domain.line_before
                    );
                }
            } else {
                if (d_from.y > d_to.y) [d_from, d_to] = [d_to, d_from];

                for (let col = d_from.x; col <= d_to.x; col++) {
                    this._drawDomain(
                        this._domaingroup,
                        this.__grid.cell(col, d_from.y),
                        this.__grid.cell(col, d_to.y),
                        this.__schematic ? '#777' : GRADIENTS.GOLD.VERT,
                        domain.style === DomainSchematicStyle.Dotted,
                        !!domain.bias_inv,
                        domain.line_after,
                        domain.line_before
                    );
                }
            }
        }
    }

    /**
     * Draws separate contact line (also called "domain" here)
     * 
     * Domain is a group of interconnected cells. 
     * It's usually represented as the non-diagonal contact line.
     * It can have different visual styles, which can be adusted through the parameters
     * of this method.
     * 
     * In schematic mode, the contact line has an offset in order not to block 
     * the contact cells themselves (which looks as the dots in this mode).
     * The line and cells are connected with the notches.
     * 
     * You can prepend and append the line without the notches 
     * by setting the `after` and `before` parameters to draw adjacent domains
     * with different styles continuously, which is needed for some of the board configurations.
     * 
     * @param container   SVG parent element to render the content to
     * @param cell_from   Starting cell of the domain
     * @param cell_to     End cell of the domain
     * @param color       Color of the domain
     * @param dotted      (schematic mode only) apply dotted style
     * @param inversed    (schematic mode only) invert line offset
     * @param after       (schematic mode only) append the line for N cells after
     * @param before      (schematic mode only) prepend the line for N cells before
     */
    private _drawDomain(
        container: SVG.Container,
        cell_from: Cell, cell_to: Cell,
        color: string = "#D4AF37",
        dotted: boolean = false,
        inversed: boolean = false,
        after: number = 0, 
        before: number = 0,
    ) {
        if (this.__schematic && typeof color !== 'string') {
            console.error('String color is not supported in schematic mode');
            return;
        }

        if (this.__schematic) {
            this._drawDomainLine(container, cell_from, cell_to, inversed, true, color, dotted);

            const is_horizontal = Cell.IsLineHorizontal(cell_from, cell_to),
                  is_vertical = Cell.IsLineVertical(cell_from, cell_to);

            if (after > 0) {
                const cell_from_add = this.__grid.cell(
                    cell_to.idx.x,
                    cell_to.idx.y
                );
                const cell_to_add = this.__grid.cell(
                    cell_to.idx.x + after * Number(is_horizontal),
                    cell_to.idx.y + after * Number(is_vertical)
                )

                this._drawDomainLine(
                    container, cell_from_add, cell_to_add, inversed, false, color, dotted
                );
            }

            if (before > 0) {
                const cell_from_add = this.__grid.cell(
                    cell_from.idx.x - before * Number(is_horizontal),
                    cell_from.idx.y - before * Number(is_vertical)
                );
                const cell_to_add = this.__grid.cell(
                    cell_from.idx.x,
                    cell_from.idx.y
                )
                this._drawDomainLine(
                    container, cell_from_add, cell_to_add, inversed, false, color, dotted
                );
            }

        } else {
            this._drawDomainRect(container, cell_from, cell_to, color);
        }
    }

    /**
     * Draws separate cell (regular point of the {@link Grid} 
     * 
     * @param container SVG parent element to render the content to
     * @param cell related {@link Cell} of the grid
     */
    private _drawCell(container: SVG.Container, cell: Cell) {
        if (this._gcells[cell.idx.x] == null) {
            this._gcells[cell.idx.x] = [];
        }

        if (this.__schematic) {
            // в простом    схематическом режиме отображать точки только в 0 ряду
            // в детальном  схематическом режиме отображать точки везде
            if (cell.isAt(null, 0) || this.__detailed) {
                this._gcells[cell.idx.x][cell.idx.y] =
                    container
                    .circle(10)
                    .center(cell.center.x, cell.center.y)
                    .fill({color: "#555"});
            }

            return;
        }

        // quad style
        this._gcells[cell.idx.x][cell.idx.y] = container
            .rect(cell.size.x, cell.size.y)
            .move(cell.pos.x, cell.pos.y)
            .fill({color: "#D4AF37", opacity: 1})
            .radius(BackgroundLayer.CellRadius);

        // [quad] lines
        container.path([
            ['M', 0, 0],
            ['M', cell.size.x * 1 / 3, 0], ['l', 0, cell.size.y],
            ['M', cell.size.x * 2 / 3, 0], ['l', 0, cell.size.y],
            ['M', 0, cell.size.y * 1 / 3], ['l', cell.size.x, 0],
            ['M', 0, cell.size.y * 2 / 3], ['l', cell.size.x, 0],
        ])
            .fill({opacity: 0})
            .stroke({color: "#FFF", width: 2, opacity: 0.2})
            .move(cell.pos.x, cell.pos.y);
    }

    /**
     * Draws separate domain as line (intended to use in schematic mode)
     * 
     * @see _drawDomain
     * 
     * @param container     SVG parent element to render the content to
     * @param cell_from     Starting cell of the line
     * @param cell_to       End cell of the line
     * @param inversed      (schematic mode only) invert line offset
     * @param use_notches   Whether to draw notches to connect the cells with the line
     * @param color         Color of the line
     * @param dotted        (schematic mode only) apply dotted style       
     */
    private _drawDomainLine(
        container: SVG.Container, 
        cell_from: Cell, 
        cell_to: Cell, 
        inversed: boolean, 
        use_notches: boolean, 
        color: string, 
        dotted: boolean
    ) {
        const is_horizontal = Cell.IsLineHorizontal(cell_from, cell_to),
              is_vertical = Cell.IsLineVertical(cell_from, cell_to);

        let len_x = Math.abs(cell_from.pos.x - cell_to.pos.x),
            len_y = Math.abs(cell_from.pos.y - cell_to.pos.y);

        let bias_x = 0,
            bias_y = 0;

        len_x = len_x >= len_y ? len_x : 0;
        len_y = len_x <  len_y ? len_y : 0;

        let bias_cont_x = 0,
            bias_cont_y = 0;

        if (this.__detailed) {
            // дорисовать засечки
            if (use_notches) {
                this._drawDomainLineNotches(container, cell_from, cell_to, inversed, color);
            }

            bias_x = is_horizontal ? 0 : BackgroundLayer.DomainSchematicBias;
            bias_y = is_vertical ? 0 : BackgroundLayer.DomainSchematicBias;

            if (inversed) {bias_x *= -1; bias_y *= -1;}
        }

        container.line(0, 0, len_x + bias_cont_x, len_y + bias_cont_y)
            .stroke({color, width: 6, linecap: 'round', dasharray: dotted ? '16' : null})
            .move(cell_from.center.x + bias_x - bias_cont_x, cell_from.center.y + bias_y - bias_cont_y)
            .opacity(0.5);
    }

    /**
     * Draws notches connecting cells and a line in the domain (intended to use in schematic mode)
     * 
     * @see _drawDomainLine
     *
     * @param container SVG parent element to render the content to 
     * @param cell_from Starting cell of the line
     * @param cell_to   End cell of the line
     * @param color     Notch color
     */
    private _drawDomainLineNotches(
        container: SVG.Container, 
        cell_from: Cell, 
        cell_to: Cell, 
        inversed: boolean, 
        color: string
    ) {
        const is_horizontal = Cell.IsLineHorizontal(cell_from, cell_to),
              is_vertical   = Cell.IsLineVertical(cell_from, cell_to);

        let pos_from  = is_horizontal ? cell_from.idx.x : cell_from.idx.y;
        let pos_to    = is_horizontal ? cell_to.idx.x   : cell_to.idx.y;

        // swap
        if (pos_from > pos_to) {[pos_to, pos_from] = [pos_from, pos_to]}

        for (let pos = pos_from; pos <= pos_to; pos++) {
            let cell = is_horizontal ? this.__grid.cell(pos, cell_from.idx.y) : this.__grid.cell(cell_from.idx.x, pos);

            let bias_x =  is_horizontal ? 0 : BackgroundLayer.DomainSchematicBias;
            let bias_y =  is_vertical   ? 0 : BackgroundLayer.DomainSchematicBias;

            let corr_x = (inversed) ? -bias_x : 0;
            let corr_y = (inversed) ? -bias_y : 0;

            container.line(0, 0, bias_x, bias_y)
                .stroke({color, width: 6, linecap: 'round'})
                .move(cell.center.x + corr_x, cell.center.y + corr_y)
                .opacity(0.5);
        }
    }

    /**
     * Draws separate domain as a rectangle (intended to use in non-schematic mode)
     * 
     * Note: non-schematic mode is now obsolete as the board faceplate does not differ from
     * schematic representation. It's still needed to keep this for older board versions though.
     * 
     * @see _drawDomain
     * 
     * @param container SVG parent element to render the content to 
     * @param cell_from Starting cell of the line
     * @param cell_to   End cell of the line
     * @param color     Rectangle color
     */
    private _drawDomainRect(
        container: SVG.Container, 
        cell_from: Cell, 
        cell_to: Cell, 
        color: string
    ) {
        const width = Math.abs(cell_from.pos.x - cell_to.pos.x),
              height = Math.abs(cell_from.pos.y - cell_to.pos.y);

        container.rect(width + cell_from.size.x, height + cell_from.size.y)
            .fill({color})
            .stroke({color})
            .move(cell_from.pos.x, cell_from.pos.y)
            .radius(10);
    }

    /**
     * Draws voltage source element (as a group of auxiliary points of the {@link Grid} 
     * if required in the domain config specified in {@link setDomainConfig})
     * 
     * @see AuxPointCategory
     * @see _drawAuxPoints
     */
    private _drawAuxPointSource() {
        if (
            !this.__grid.isAuxPointCatRequired(AuxPointCategory.SourceV5) &&
            !this.__grid.isAuxPointCatRequired(AuxPointCategory.SourceV8)
        ) return;

        const   p_vcc = this.__grid.auxPoint(AuxPointType.Vcc) as AuxPoint,
                p_gnd = this.__grid.auxPoint(AuxPointType.Gnd) as AuxPoint;

        // try {
            // Line takeaway/rise
            let rise = 40;

            // Point positions corrected to prevent current overlay
            const vcc_pos = {x: p_vcc.pos.x, y: p_vcc.pos.y + 8},
                  gnd_pos = {x: p_gnd.pos.x, y: p_gnd.pos.y - 8};

            // Top/bottom bias (detailed schematic view only)
            let bias = 0,
                vcc_cell_pos_x = p_vcc.cell.pos.x,
                gnd_cell_pos_x = p_gnd.cell.pos.x;

            if (this.__schematic && this.__detailed) {
                bias = BackgroundLayer.DomainSchematicBias;
                vcc_cell_pos_x = p_vcc.cell.center.x;
                gnd_cell_pos_x = p_gnd.cell.center.x;
            }

            // Voltage source line, actually
            this._decogroup.path([
                ['M', vcc_pos.x, vcc_pos.y],
                ['L', vcc_pos.x, p_vcc.cell.center.y - bias],
                ['l', vcc_cell_pos_x - vcc_pos.x, 0]
            ])
                .fill({color: 'none'})
                .stroke({color: "#777", width: 6, linecap: 'round'})
                .opacity(0.5);
                // .fill({opacity: 0})
                // .stroke({color: "#000", width: 2, opacity: 1});

            this._decogroup.path([
                ['M', gnd_pos.x, gnd_pos.y],
                ['L', gnd_pos.x, p_gnd.cell.center.y + bias],
                ['l', gnd_cell_pos_x - gnd_pos.x, 0],
            ])
                .fill({color: 'none'})
                .stroke({color: "#777", width: 6, linecap: 'round'})
                .opacity(0.5);
                // .fill({opacity: 0})
                // .stroke({color: "#000", width: 2, opacity: 1});

            this._decogroup.line(0, 0, rise * 2.5, 0)
                .center(vcc_pos.x, vcc_pos.y)
                .stroke({color: "#f00", width: 6, opacity: 1, linecap: 'round'});

            this._decogroup.line(0, 0, rise * 1.5, 0)
                .center(gnd_pos.x, gnd_pos.y)
                .stroke({color: "#00f", width: 6, opacity: 1, linecap: 'round'});

            const   cap_size = 42,
                    cap_pos_x = vcc_pos.x - rise * 1.25;

            // Pole caption 1
            this._decogroup
                .text("+")
                .fill({color: "#f00"})
                .font({size: cap_size, family: "'Lucida Console', Monaco, monospace", weight: "bold"})
                .center(cap_pos_x, vcc_pos.y - cap_size / 2);

            // Pole caption 2
            this._decogroup
                .text("-")
                .fill({color: "#00f"})
                .font({size: cap_size, family: "'Lucida Console', Monaco, monospace", weight: "bold"})
                .center(cap_pos_x, gnd_pos.y + cap_size / 2);


        // } catch (re) {
        //     console.error("Invalid reference cells has been selected to draw voltage source line");
        // }
    }

    /**
     * Draws usb ports (as a groups of auxiliary points of the {@link Grid} 
     * if required in the domain config specified in {@link setDomainConfig})
     * 
     * @see AuxPointCategory
     * @see _drawAuxPoints
     */
    private _drawAuxPointUsbs() {
        if (this.__grid.isAuxPointCatRequired(AuxPointCategory.Usb1)) {
            this._drawAuxPointUsb(
                this.__grid.auxPoint(AuxPointType.U1Vcc) as AuxPoint,
                this.__grid.auxPoint(AuxPointType.U1Gnd) as AuxPoint,
                this.__grid.auxPoint(AuxPointType.U1Analog1) as AuxPoint,
                this.__grid.auxPoint(AuxPointType.U1Analog2) as AuxPoint,
            );
        }

        if (this.__grid.isAuxPointCatRequired(AuxPointCategory.Usb3)) {
            this._drawAuxPointUsb(
                this.__grid.auxPoint(AuxPointType.U3Vcc) as AuxPoint,
                this.__grid.auxPoint(AuxPointType.U3Gnd) as AuxPoint,
                this.__grid.auxPoint(AuxPointType.U3Analog1) as AuxPoint,
                this.__grid.auxPoint(AuxPointType.U3Analog2) as AuxPoint,
            );
        }
    }

    /**
     * Draws specific USB port from its {@link AuxPointCategory}
     * 
     * @see _drawAuxPointUsbs
     * 
     * @param p_vcc an auxiliary point for VCC contact of the USB port
     * @param p_gnd an auxiliary point for gnD contact of the USB port
     * @param p_an1 an auxiliary point for Analog1 contact of the USB port
     * @param p_an2 an auxiliary point for Analog2 contact of the USB port
     */
    private _drawAuxPointUsb(p_vcc: AuxPoint, p_gnd: AuxPoint, p_an1: AuxPoint, p_an2: AuxPoint) {
        this._drawAuxPointUsbPath(p_vcc, BackgroundLayer.DomainSchematicBias);
        this._drawAuxPointUsbPath(p_gnd, BackgroundLayer.DomainSchematicBias);
        this._drawAuxPointUsbPath(p_an1);
        this._drawAuxPointUsbPath(p_an2);
    }

    /**
     * Draws the contact line for the specific contact of USB port
     * 
     * @see _drawAuxPointUsb
     * 
     * @param point         an auxiliary point for the contact
     * @param bias_domain   an offset of the domain lines relative to cell positions in schematic mode
     */
    private _drawAuxPointUsbPath(point: AuxPoint, bias_domain: number = 0) {
        let needs_bias = this.__schematic && this.__detailed;
        bias_domain = bias_domain * Number(needs_bias);

        const cell_x = needs_bias ? point.cell.center.x : point.cell.pos.x + point.cell.size.x;

        try {
            this._decogroup.path([
                ['M', point.pos.x, point.pos.y],
                ['l', -point.bias, 0],
                ['l', 0, point.cell.center.y - point.pos.y],
                ['l', cell_x - point.pos.x + point.bias + bias_domain, 0]
            ])
                .fill({color: 'none'})
                .stroke({color: "#777", width: 6, linecap: 'round'})
                .opacity(0.5);
        } catch (re) {
            console.error("Invalid reference cells has been selected to draw voltage source line");
        }
    }
}