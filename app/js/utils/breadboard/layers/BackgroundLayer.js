import Breadboard from "../Breadboard";
import Layer from "../core/Layer";
import Grid from "../core/Grid";
import PlateContextMenu from "../menus/PlateContextMenu";

import {logoSVG, leafSVG} from "../styles/paths";
import {GRADIENTS} from "../styles/gradients";

const LOGO_COLOR_ACTIVE     = "#6B8FFF";
const LOGO_COLOR_DEFAULT    = "#000000";

export default class BackgroundLayer extends Layer {
    static get Class() {return "bb-layer-background"}

    constructor(container, grid, schematic=false) {
        super(container, grid, schematic);

        this._container.addClass(BackgroundLayer.Class);

        this._boardgroup    = undefined;
        this._logogroup     = undefined;

        this._domaingroup   = undefined;
        this._currentgroup     = undefined;
        this._decogroup     = undefined;

        this._callbacks = {
            logoclick: () => {}
        };

        this._logo_flower   = undefined;
        this._logo_text     = undefined;

        this._is_logo_clicked = false;

        this._initGroups();
    }

    compose() {
        this._boardgroup
            .rect('99%', '99%') /// 99 из-за обрезания рамки
            .radius(20)
            .fill({color: "#f9f9f9"})
            .stroke({color: "#c9c9c9", width: 4})
            .move(4, 4);

        this._drawLogo();
        this._drawDeco();
        this._drawDomains();
        this._drawCells();
    }

    recompose(schematic) {
        super.recompose(schematic);

        this._initGroups();
        this.compose();

        // re-click
        this.toggleLogoActive(this._is_logo_clicked);
    }

    clickLogo() {
        this._logogroup.fire('click');
    }

    onLogoClick(cb) {
        if (!cb) {this._callbacks.logoclick = () => {}}

        this._callbacks.logoclick = cb;
    }

    _initGroups() {
        this._clearGroups();

        this._boardgroup    = this._container.group();
        this._logogroup     = this._container.group().id("logogroup");
        this._domaingroup   = this._container.group();
        this._currentgroup     = this._container.group();
        this._decogroup     = this._container.group();
    }

    _clearGroups() {
        if (this._boardgroup)   this._boardgroup.remove();
        if (this._logogroup)    this._logogroup.remove();
        if (this._domaingroup)  this._domaingroup.remove();
        if (this._currentgroup)    this._currentgroup.remove();
        if (this._decogroup)    this._decogroup.remove();
    }

    _drawLogo() {
        let image = this._logogroup
            .nested();

        let text = this._logogroup.path(logoSVG());

        let flower = image.group();
        let leaf = flower.symbol();

        leaf.path(leafSVG()).scale(4);

        flower.use(leaf).rotate(0, 32, 65.5);
        flower.use(leaf).rotate(60, 32, 65.5);
        flower.use(leaf).rotate(120, 32, 65.5);
        flower.use(leaf).rotate(180, 32, 65.5);
        flower.use(leaf).rotate(240, 32, 65.5);
        flower.use(leaf).rotate(300, 32, 65.5);

        flower.move(18,0);
        flower.scale(0.7);

        text.move(-70, 5);

        text.scale(0.5);

        this._logo_text = text;
        this._logo_flower = flower;

        this._logogroup.cx(100 + this.__grid.size.x / 2);

        this._logogroup.style({cursor: 'pointer'});

        this._logogroup.click((evt) => {
            this.toggleLogoActive(!this._is_logo_clicked);

            this._callbacks.logoclick();
        });
    }

    toggleLogoActive(on=true, animate=true) {
        if (on) {
            if (animate) {
                this._logo_text.animate('100ms').fill(LOGO_COLOR_ACTIVE);
                this._logo_flower.animate('100ms').fill(LOGO_COLOR_ACTIVE);
            } else {
                this._logo_text.fill(LOGO_COLOR_ACTIVE);
                this._logo_flower.fill(LOGO_COLOR_ACTIVE);
            }
        } else {
            if (animate) {
                this._logo_text.animate('100ms').fill(LOGO_COLOR_DEFAULT);
                this._logo_flower.animate('100ms').fill(LOGO_COLOR_DEFAULT);
            } else {
                this._logo_text.fill(LOGO_COLOR_DEFAULT);
                this._logo_flower.fill(LOGO_COLOR_DEFAULT);
            }
        }

        this._is_logo_clicked = on;
    }

    _drawDeco() {
        try {
            // Voltage source line reference points
            let cell1 = this.__grid.cell(0, 1, Grid.BorderTypes.Wrap);
            let cell2 = this.__grid.cell(0, 5, Grid.BorderTypes.Wrap);
            let cell3 = this.__grid.cell(0, 6, Grid.BorderTypes.Wrap);
            let cell4 = this.__grid.cell(0, -1, Grid.BorderTypes.Wrap);

            // Line takeaway/rise
            let rise = 40;

            let gap_begin_y = cell2.center.y + this.__grid.gap.y * 5/3,
                gap_end_y   = cell3.center.y - this.__grid.gap.y * 5/3;

            // Voltage source line, actually
            this._decogroup.path([
                ['M', cell1.pos.x, cell1.center.y],
                ['l', -rise, 0],
                ['L', cell2.pos.x-rise, gap_begin_y],
                ['M', cell3.pos.x-rise, gap_end_y],
                ['L', cell4.pos.x-rise, cell4.center.y],
                ['l', rise, 0],
            ])
                .fill({opacity: 0})
                .stroke({color: "#000", width: 2, opacity: 1});

            this._decogroup.path([
                ['M', cell1.pos.x - rise * 2, gap_begin_y],
                ['l', rise * 2, 0],
            ])
                .stroke({color: "#f00", width: 6, opacity: 1, linecap: 'round'});
            ;

            this._decogroup.path([
                ['M', cell3.pos.x - rise * 1.5, gap_end_y],
                ['l', rise, 0]
            ])
                .fill({opacity: 0})
                .stroke({color: "#00f", width: 6, opacity: 1, linecap: 'round'});

            let cap_size = 42;

            let cap_pos_x = cell2.pos.x - rise * 2 + cap_size / 4;

            // Pole caption 1
            this._decogroup
                .text("+")
                .fill({color: "#f00"})
                .font({size: cap_size, family: "'Lucida Console', Monaco, monospace", weight: "bold"})
                .center(cap_pos_x, gap_begin_y - cap_size / 1.5);

            // Pole caption 2
            this._decogroup
                .text("-")
                .fill({color: "#00f"})
                .font({size: cap_size, family: "'Lucida Console', Monaco, monospace", weight: "bold"})
                .center(cap_pos_x, gap_begin_y + cap_size);


        } catch (re) {
            console.error("Invalid reference cells has been selected to draw voltage source line");
        }
    }

    _drawCells() {
        for (let col of this.__grid.cells) {
            for (let cell of col) {
                this._drawCell(this._currentgroup, cell);
            }
        }
    }

    _drawDomains() {
        for (let col of this.__grid.cells) {
            this._drawDomain(this._domaingroup, col[2], col[5], this.__schematic ? '#555' : GRADIENTS.GOLD.VERT);
            this._drawDomain(this._domaingroup, col[6], col[9], this.__schematic ? '#555' : GRADIENTS.GOLD.VERT);
        }

        this._drawDomain(
            this._domaingroup,
            this.__grid.cell(0,1),
            this.__grid.cell(9,1),
            this.__schematic ? '#555' : GRADIENTS.GOLD.HORZ
        );
        this._drawDomain(
            this._domaingroup,
            this.__grid.cell(0,10),
            this.__grid.cell(9,10),
            this.__schematic ? '#555' : GRADIENTS.GOLD.HORZ
        );
    }

    /**
     *
     * @param {SVG.Container}   container
     * @param {Cell}            cell_from
     * @param {Cell}            cell_to
     * @param {SVG.Gradient}    color
     * @private
     */
    _drawDomain(container, cell_from, cell_to, color="#D4AF37") {
        let width = Math.abs(cell_from.pos.x - cell_to.pos.x);
        let height = Math.abs(cell_from.pos.y - cell_to.pos.y);

        if (this.__schematic && typeof color !== 'string') {
            console.error('String color is not supported in schematic mode');
            return;
        };

        if (this.__schematic) {
            width   = width >= height ? Math.max(width, height) : 0;
            height  = width <  height ? Math.max(width, height) : 0;

            container.line(0, 0, width, height)
                .stroke({color, width: 6, linecap: 'round'})
                .move(cell_from.center.x, cell_from.center.y)
                .opacity(0.5)
        } else {
            container.rect(width + cell_from.size.x, height + cell_from.size.y)
                .fill({color})
                .stroke({color})
                .move(cell_from.pos.x, cell_from.pos.y)
                .radius(10);
        }

    }

    // _drawContact(container, cell_from, cell_to, color="#000") {
    //     let len = {
    //         x: math.sqrt(cell_from.pos.x * cell_from.pos.x - cell_to.pos.x * cell_to.pos.x),
    //         y: math.sqrt(cell_from.pos.y * cell_from.pos.y - cell_to.pos.y * cell_to.pos.y),
    //     };
    //
    //     if (this.__schematic && typeof color !== 'string') {
    //         console.error('String color is not supported in schematic mode');
    //         return;
    //     };
    // }

    _drawCell(container, cell) {
        if (this.__schematic) {
            if (cell.isAt(null, 0)) {
                container
                    .circle(6, 6)
                    .center(cell.center.x, cell.center.y)
                    .fill({color: "#555"})
            }

            return;
        };

        // container
        //     .circle(cell.size.x)
        //     .move(cell.pos.x, cell.pos.y)
        //     .fill({color: GRADIENTS.GOLD.RADIAL, opacity: 1})
        //     .stroke({color: "#6f6f6f", opacity: 0.5});

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
}