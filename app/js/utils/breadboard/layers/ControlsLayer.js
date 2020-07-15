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

        this._addgroup      = undefined;
        this._cleargroup    = undefined;
        this._menugroup     = this._container.group();
        this._logogroup     = undefined;

        this._logo_flower   = undefined;
        this._logo_text     = undefined;

        this._ctxmenu       = new BoardContextMenu(this._menugroup, grid);
        this._ctxmenu.onItemClick((alias, value) => {this._callbacks.ctxmenuitemclick(alias, value)});

        this._callbacks = {
            add: () => {},
            clear: () => {},
            fullscreen: () => {},
            capture: () => {},
            ctxmenuitemclick: () => {},
            logoclick: () => {}
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
        this._drawMenuPrimary(plate_types, plate_captions);
        this._drawMenuSecondary();
        this._drawLogo();
        this._hide();
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

    onAdd(cb) {
        if (!cb) {
            this._callbacks.add = () => {};
        } else {
            this._callbacks.add = cb;
        }
    }

    onClear(cb) {
        if (!cb) {
            this._callbacks.clear = () => {};
        } else {
            this._callbacks.clear = cb;
        }
    }

    onFullscreen(cb) {
        if (!cb) {
            this._callbacks.fullscreen = () => {};
        } else {
            this._callbacks.fullscreen = cb;
        }
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
                let cursor_point = Breadboard._getCursorPoint(svg_main, evt.clientX, evt.clientY);

                this._ctxmenu.draw(cursor_point, false);
            } else {
                this._ctxmenu.dispose();
            }
        };

        return this._oncontextmenu;
    }

    _drawLogo() {
        this._logogroup = this._container.group().id("logogroup");

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
        this._addgroup.style.display = "block";
        this._cleargroup.style.display = "block";

        this._attachEventListeners();
    }

    _hide() {
        this._addgroup.style.display = "none";
        this._cleargroup.style.display = "none";

        this._detachEventListeners();
    }

    _drawMenuPrimary(plate_types, plate_captions) {
        this._addgroup = this._getEmbeddedHtmlGroup(this._params.w1, this._params.h1, this._params.x1, this._params.y1);

        let wrap = document.createElement("div");
        let input = document.createElement("input");
        let select = document.createElement("select");
        let btn_apply = document.createElement("a");

        wrap.classList += "bb-plate-left-wrap";
        input.classList += "bb-plate-add-input";
        select.classList += "bb-plate-add-selector";
        btn_apply.classList += "bb-plate-btn-add";

        let options = plate_types;

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            let el = document.createElement("option");
            el.textContent = plate_captions[opt];
            el.value = opt;

            select.appendChild(el);
        }

        btn_apply.addEventListener("click", () => {
            let plate_type = select.options[select.selectedIndex].value;
            let extra = input.value;

            this._callbacks.add(plate_type, extra);
        });

        btn_apply.innerHTML = "Добавить";

        wrap.appendChild(select);
        wrap.appendChild(input);
        wrap.appendChild(btn_apply);

        this._addgroup.appendChild(wrap);
    }

    _drawMenuSecondary() {
        this._cleargroup = this._getEmbeddedHtmlGroup(this._params.w2, this._params.h2, this._params.x2, this._params.y2);

        let wrap = document.createElement("div");
        let btn_clear = document.createElement("a");
        let btn_fullscreen = document.createElement("a");

        wrap.classList += "bb-plate-right-wrap";
        btn_clear.classList += "bb-plate-btn-clear";
        btn_fullscreen.classList += "bb-plate-btn-fullscreen";

        btn_clear.addEventListener("click", () => {
            this._callbacks.clear();
        });

        btn_fullscreen.addEventListener("click", () => {
            this._is_fullscreen = !this._is_fullscreen;
            this._callbacks.fullscreen(this._is_fullscreen);

            btn_fullscreen.innerHTML = this._is_fullscreen ? "Свернуть" : "Во весь экран";
        });

        btn_clear.innerHTML = "Очистить всё";
        btn_fullscreen.innerHTML = "Во весь экран";

        wrap.appendChild(btn_clear);
        wrap.appendChild(btn_fullscreen);
        this._cleargroup.appendChild(wrap);
    }

    _getEmbeddedHtmlGroup(width=0, height=0, x=0, y=0) {
        let fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        fo.classList.add("node");
        fo.setAttribute("width", width);
        fo.setAttribute("height", height);
        fo.setAttribute("x", x);
        fo.setAttribute("y", y);

        this._container.node.appendChild(fo);

        let body = document.createElement("div");
        body.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

        fo.appendChild(body);

        return body;
    }
}
