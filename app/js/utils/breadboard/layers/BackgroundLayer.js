import Breadboard from "../Breadboard";
import Layer from "../core/Layer";
import Grid from "../core/Grid";
import Cell from "../core/Cell";
import PlateContextMenu from "../menus/PlateContextMenu";

import {GRADIENTS} from "../styles/gradients";

const DOMAIN_SCHEMATIC_STYLES = {
    Default: 'default',
    Dotted: 'dotted',
    None: 'none'
}

export default class BackgroundLayer extends Layer {
    static get Class() {return "bb-layer-background"}

    /** отклонение линий доменов в схематическом режиме */
    static get DomainSchematicBias() {return 20}

    static get DomainSchematicStyles() {return DOMAIN_SCHEMATIC_STYLES}

    constructor(container, grid, schematic=false, detailed=false) {
        super(container, grid, schematic, detailed);

        this._container.addClass(BackgroundLayer.Class);

        this._boardgroup    = undefined;

        this._domaingroup   = undefined;
        this._currentgroup  = undefined;
        this._decogroup     = undefined;

        this._domain_config = undefined;

        this._initGroups();
    }

    setDomainConfig(domain_config) {
        this._domain_config = domain_config;
    }

    compose() {
        this._boardgroup
            .rect('99%', '99%') /// 99 из-за обрезания рамки
            .radius(20)
            .fill({color: "#f9f9f9"})
            .stroke({color: "#c9c9c9", width: 4})
            .move(4, 4);

        this._drawAuxPoints();
        this._drawDomains();
        this._drawCells();
    }

    recompose(schematic, detailed) {
        super.recompose(schematic, detailed);

        this._initGroups();
        this.compose();
    }

    _initGroups() {
        this._clearGroups();

        this._boardgroup    = this._container.group();
        this._domaingroup   = this._container.group();
        this._currentgroup  = this._container.group();
        this._decogroup     = this._container.group();
    }

    _clearGroups() {
        if (this._boardgroup)   this._boardgroup.remove();
        if (this._domaingroup)  this._domaingroup.remove();
        if (this._currentgroup) this._currentgroup.remove();
        if (this._decogroup)    this._decogroup.remove();
    }

    _drawAuxPoints() {
        this._drawAuxPointSource();
        this._drawAuxPointUsbs();
    }

    _drawCells() {
        for (let col of this.__grid.cells) {
            for (let cell of col) {
                this._drawCell(this._currentgroup, cell);
            }
        }
    }

    _drawDomains() {
        if (!this._domain_config) return;

        for (const domain of this._domain_config) {
            const   d_from  = this.__grid.cell(domain.from.x, domain.from.y, Grid.BorderTypes.Wrap).idx,
                    d_to    = this.__grid.cell(domain.to.x, domain.to.y, Grid.BorderTypes.Wrap).idx;

            if (domain.style === BackgroundLayer.DomainSchematicStyles.None) continue;

            if (domain.horz) {
                for (let row = d_from.y; row <= d_to.y; row++) {
                    this._drawDomain(
                        this._domaingroup,
                        this.__grid.cell(d_from.x, row),
                        this.__grid.cell(d_to.x, row),
                        !!domain.inv,
                        !!domain.cont,
                        this.__schematic ? '#777' : GRADIENTS.GOLD.HORZ,
                        domain.style === BackgroundLayer.DomainSchematicStyles.Dotted
                    );
                }
            } else {
                for (let col = d_from.x; col <= d_to.x; col++) {
                    this._drawDomain(
                        this._domaingroup,
                        this.__grid.cell(col, d_from.y),
                        this.__grid.cell(col, d_to.y),
                        !!domain.inv,
                        !!domain.cont,
                        this.__schematic ? '#777' : GRADIENTS.GOLD.VERT,
                        domain.style === BackgroundLayer.DomainSchematicStyles.Dotted
                    );
                }
            }
        }
    }

    /**
     *
     * @param {SVG.Container}   container
     * @param {Cell}            cell_from
     * @param {Cell}            cell_to
     * @param {boolean}         inversed
     * @param {boolean}         cont        whether to continue (previous) domain, in order to switch style
     * @param {SVG.Gradient}    color
     * @param dotted
     * @private
     */
    _drawDomain(container, cell_from, cell_to, inversed=false, cont=false, color="#D4AF37", dotted=false) {
        if (this.__schematic && typeof color !== 'string') {
            console.error('String color is not supported in schematic mode');
            return;
        }

        if (this.__schematic) {
            this._drawDomainLine(container, cell_from, cell_to, inversed, cont, color, dotted);
        } else {
            this._drawDomainRect(container, cell_from, cell_to, color);
        }
    }

    _drawCell(container, cell) {
        if (this.__schematic) {
            // в простом    схематическом режиме отображать точки только в 0 ряду
            // в детальном  схематическом режиме отображать точки везде
            if (cell.isAt(null, 0) || this.__detailed) {
                container
                    .circle(10, 10)
                    .center(cell.center.x, cell.center.y)
                    .fill({color: "#555"})
            }

            return;
        }

        // quad style
        container
            .rect(cell.size.x, cell.size.y)
            .move(cell.pos.x, cell.pos.y)
            .fill({color: "#D4AF37", opacity: 1})
            .radius(Breadboard.CellRadius);

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

    _drawDomainLine(container, cell_from, cell_to, inversed, cont, color, dotted) {
        let len_x = Math.abs(cell_from.pos.x - cell_to.pos.x),
            len_y = Math.abs(cell_from.pos.y - cell_to.pos.y);

        const is_horizontal = Cell.IsLineHorizontal(cell_from, cell_to),
              is_vertical = Cell.IsLineVertical(cell_from, cell_to);

        let bias_x = 0,
            bias_y = 0;

        len_x = len_x >= len_y ? len_x : 0;
        len_y = len_x <  len_y ? len_y : 0;

        let bias_cont_x = 0,
            bias_cont_y = 0;

        if (cont && len_x) {
            bias_cont_x = this.__grid.cell(1, 0).pos.x - this.__grid.cell(0, 0).pos.x;
        }

        if (cont && len_y) {
            bias_cont_y = this.__grid.cell(0, 1).pos.y - this.__grid.cell(0, 0).pos.y;
        }

        if (this.__detailed) {
            // дорисовать засечки
            this._drawDomainLineNotches(container, cell_from, cell_to, inversed, color);

            bias_x = is_horizontal ? 0 : BackgroundLayer.DomainSchematicBias;
            bias_y = is_vertical ? 0 : BackgroundLayer.DomainSchematicBias;

            if (inversed) {bias_x *= -1; bias_y *= -1;}
        }

        container.line(0, 0, len_x + bias_cont_x, len_y + bias_cont_y)
            .stroke({color, width: 6, linecap: 'round', dasharray: dotted ? 16 : null})
            .move(cell_from.center.x + bias_x - bias_cont_x, cell_from.center.y + bias_y - bias_cont_y)
            .opacity(0.5);
    }

    /**
     * Только для детального схематического режима
     *
     * @param container
     * @param cell_from
     * @param cell_to
     * @param color
     * @private
     */
    _drawDomainLineNotches(container, cell_from, cell_to, inversed, color) {
        const is_horizontal = Cell.IsLineHorizontal(cell_from, cell_to),
              is_vertical   = Cell.IsLineVertical(cell_from, cell_to);

        let pos_from  = is_horizontal ? cell_from.idx.x : cell_from.idx.y;
        let pos_to    = is_horizontal ? cell_to.idx.x   : cell_to.idx.y;

        // swap
        if (pos_from > pos_to) {pos_to = [pos_from, pos_from = pos_to]}

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

    _drawDomainRect(container, cell_from, cell_to, color) {
        const width = Math.abs(cell_from.pos.x - cell_to.pos.x),
              height = Math.abs(cell_from.pos.y - cell_to.pos.y);

        container.rect(width + cell_from.size.x, height + cell_from.size.y)
            .fill({color})
            .stroke({color})
            .move(cell_from.pos.x, cell_from.pos.y)
            .radius(10);
    }

    _drawAuxPointSource() {
        if (!this.__grid.isAuxPointCatRequired(Grid.AuxPointCats.Source)) return;

        const   p_vcc = this.__grid.auxPoint(Grid.AuxPoints.Vcc),
                p_gnd = this.__grid.auxPoint(Grid.AuxPoints.Gnd);

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

    _drawAuxPointUsbs() {
        if (this.__grid.isAuxPointCatRequired(Grid.AuxPointCats.Usb1)) {
            this._drawAuxPointUsb(
                this.__grid.auxPoint(Grid.AuxPoints.U1Vcc),
                this.__grid.auxPoint(Grid.AuxPoints.U1Gnd),
                this.__grid.auxPoint(Grid.AuxPoints.U1Analog1),
                this.__grid.auxPoint(Grid.AuxPoints.U1Analog2),
            );
        }

        if (this.__grid.isAuxPointCatRequired(Grid.AuxPointCats.Usb3)) {
            this._drawAuxPointUsb(
                this.__grid.auxPoint(Grid.AuxPoints.U3Vcc),
                this.__grid.auxPoint(Grid.AuxPoints.U3Gnd),
                this.__grid.auxPoint(Grid.AuxPoints.U3Analog1),
                this.__grid.auxPoint(Grid.AuxPoints.U3Analog2),
            );
        }
    }

    _drawAuxPointUsb(p_vcc, p_gnd, p_an1, p_an2) {
        this._drawAuxPointUsbPath(p_vcc, 20, BackgroundLayer.DomainSchematicBias);
        this._drawAuxPointUsbPath(p_gnd, 20, BackgroundLayer.DomainSchematicBias);
        this._drawAuxPointUsbPath(p_an1, 40);
        this._drawAuxPointUsbPath(p_an2, 40);
    }

    _drawAuxPointUsbPath(point, bias, bias_domain=0) {
        try {
            this._decogroup.path([
                ['M', point.pos.x, point.pos.y],
                ['l', -bias, 0],
                ['l', 0, point.cell.center.y - point.pos.y],
                ['l', point.cell.center.x - point.pos.x + bias + bias_domain, 0]
            ])
                .fill({color: 'none'})
                .stroke({color: "#777", width: 6, linecap: 'round'})
                .opacity(0.5);
        } catch (re) {
            console.error("Invalid reference cells has been selected to draw voltage source line");
        }
    }
}