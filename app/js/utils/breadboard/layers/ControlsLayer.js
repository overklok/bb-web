import Layer from "../core/Layer";
import BoardContextMenu from "../menus/BoardContextMenu";
import Breadboard from "../Breadboard";
import BackgroundLayer from "../layers/BackgroundLayer";
import LabelLayer from "../layers/LabelLayer";
import ContextMenu from "../core/ContextMenu";
import {leafSVG, logoSVG} from "../styles/paths";

const LOGO_COLOR_ACTIVE     = "#6B8FFF";
const LOGO_COLOR_DEFAULT    = "#000000";

export default class ControlsLayer extends Layer {
    static get Class() {return "bb-layer-controls"}

    constructor(container, grid, schematic=false) {
        super(container, grid, schematic);

        this._container.addClass(ControlsLayer.Class);

        this._menugroup     = undefined;
        this._logogroup     = undefined;

        this._logo_flower   = undefined;
        this._logo_text     = undefined;

        this._ctxmenu       = undefined;

        this._callbacks = {
            ctxmenuitemclick: () => {},
            logoclick: () => {},
            menuclick: () => {}
        };

        this._is_fullscreen = false;
        this._is_visible = false;
        this._is_visibility_blocked = false;
        this._is_logo_clicked = false;

        this.setLayoutConfig();
    }

    setLayoutConfig(config) {
        config = config || {};

        this._params = {
            x1: config.horz ? 130 : 10,
            y1: config.horz ? 0 : 40,
            w1: config.horz ? 240 : 180,
            h1: config.horz ? 120 : 120,

            x2: config.horz ? 850 : 10,
            y2: config.horz ? 0 : this.__grid.size.y - 40,
            w2: config.horz ? 210 : 180,
            h2: config.horz ? 120 : 120,

            logo_horz: !!config.horz,
        };
    }

    compose(plate_types, plate_captions) {
        this._logogroup = this._container.group().id("logogroup");
        this._menugroup = this._container.group();
        this._buttongroup = this._container.nested();

        this._drawLogo();
        this._drawMenuButton();

        this._hide();

        this._ctxmenu       = new BoardContextMenu(this._menugroup, this.__grid);
        this._ctxmenu.onItemClick((alias, value) => {this._callbacks.ctxmenuitemclick(alias, value)})
    }

    setVisibility(is_visible) {
        this._is_visible = is_visible;
        is_visible ? this._show() : this._hide();
    }

    switchVisibility() {
        if (this._is_visibility_blocked) {return;}

        this.setVisibility(!this._is_visible);
    }

    setVisibilityBlocking(blocked) {
        this._is_visibility_blocked = blocked;
    }

    clickLogo() {
        this._logogroup.fire('click');
    }

    toggleButtonDisplay(on=true) {
        if (on) {
            this._buttongroup.show();
        } else {
            this._buttongroup.hide();
        }
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

    onMenuClick(cb) {
        if (!cb) {this._callbacks.menuclick = () => {}; return}

        this._callbacks.menuclick = cb;
    }

    onLogoClick(cb) {
        if (!cb) {this._callbacks.logoclick = () => {}}

        this._callbacks.logoclick = cb;
    }

    /**
     * Установить обработчик нажатия на пункт контекстного меню плашки
     *
     * @param {function} cb обработчик нажатия на пункт контекстного меню плашки.
     */
    onContextMenuItemClick(cb) {
        if (!cb) {this._callbacks.ctxmenuitemclick = () => {}}

        this._callbacks.ctxmenuitemclick = cb;
    }

    _attachEventListeners() {
        document.addEventListener("mousedown", this._onMouseDown(), false);
        document.addEventListener("contextmenu", this._onContextMenu(), false);
    }

    _detachEventListeners() {
        document.removeEventListener("mousedown", this._onMouseDown(), false);
        document.removeEventListener("contextmenu", this._onContextMenu(), false);
    }

    _onMouseDown() {
        if (this._onmousedown) {
            return this._onmousedown;
        }

        this._onmousedown = (evt) => {
            if (evt.target.classList.contains(ContextMenu.ItemClass)) return;
            if (evt.target.classList.contains(ContextMenu.ItemInputClass)) return;

            if (evt.which !== 3) {
                this._ctxmenu.dispose();
            }
        };

        return this._onmousedown;
    }

    _onContextMenu() {
        if (this._oncontextmenu) {
            return this._oncontextmenu;
        }

        this._oncontextmenu = (evt) => {
            let el = evt.target;

            /// Определить, является ли элемент, по которому выполнено нажатие, частью слоя
            while ((el = el.parentElement) && !(
                el.classList.contains(BackgroundLayer.Class) ||
                el.classList.contains(LabelLayer.Class)
            )) {}

            if (el) {
                evt.preventDefault();

                let svg_main = this._container.node;
                let cursor_point = Breadboard.getCursorPoint(svg_main, evt.clientX, evt.clientY);

                this._ctxmenu.draw(cursor_point, false);
            } else {
                this._ctxmenu.dispose();
            }
        };

        return this._oncontextmenu;
    }

    _drawMenuButton() {
        this._buttongroup
            .click(() => this._callbacks.menuclick())
            .style({cursor: 'pointer'});

        this._buttongroup.rect(30, 25).move(20, 20).fill({color: '#afafaf'});

        this._buttongroup.rect(30, 5).move(20, 20);
        this._buttongroup.rect(30, 5).move(20, 30);
        this._buttongroup.rect(30, 5).move(20, 40);
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

        if (this._params.logo_horz) {
            this._logogroup.cx(100 + this.__grid.size.x / 2);
        } else {
            this._logogroup.cy(100 + this.__grid.size.y / 2)
                .x(-140)
                .rotate(-90)
        }

        this._logogroup.style({cursor: 'pointer'});

        this._logogroup.click((evt) => {
            this.toggleLogoActive(!this._is_logo_clicked);

            this._callbacks.logoclick();
            this.switchVisibility();
        });
    }

    _show() {
        this._buttongroup.show();
        this._attachEventListeners();
    }

    _hide() {
        this._buttongroup.hide();
        this._detachEventListeners();
    }
}
