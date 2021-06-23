import Layer from "../core/Layer";
import BackgroundLayer from "js/utils/breadboard/layers/BackgroundLayer";
import LabelLayer from "js/utils/breadboard/layers/LabelLayer";
import {getCursorPoint} from "js/utils/breadboard/core/extras/helpers";
import BoardContextMenu from "js/utils/breadboard/menus/BoardContextMenu";

export default class ControlsLayer extends Layer {
    static get Class() {return "bb-layer-controls"}

    static get MenuButtonId() {return "bb-btn-menu"}

    constructor(container, grid, schematic=false) {
        super(container, grid, schematic);

        this._container.addClass(ControlsLayer.Class);

        this._callbacks = {
            menuclick: () => {}
        };

        this._is_fullscreen = false;

        this.setLayoutConfig();

        this._handleContextMenu = this._handleContextMenu.bind(this);

        this._menu = new BoardContextMenu();
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

    compose() {
        this._buttongroup = this._container.nested().id(ControlsLayer.MenuButtonId);

        document.addEventListener('contextmenu', this._handleContextMenu, false);
        document.addEventListener('keyup', this.handleKey, false);
        this._drawMenuButton();

        this._hide();
    }

    addContextMenuItem(alias, label, active) {
        this._menu.addItem(alias, label, active);
    }

    setVisibility(is_visible) {
        is_visible ? this._show() : this._hide();
    }

    toggleButtonDisplay(on=true) {
        if (on) {
            this._buttongroup.show();
        } else {
            this._buttongroup.hide();
        }
    }

    onMenuClick(cb) {
        if (!cb) {this._callbacks.menuclick = () => {}; return}

        this._callbacks.menuclick = cb;
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

    _show() {
        this._buttongroup.show();
    }

    _hide() {
        this._buttongroup.hide();
    }

    /**
     * @param {MouseEvent} evt
     * @private
     */
    _handleContextMenu(evt) {
        let el = evt.target;

        /// Определить, является ли элемент, по которому выполнено нажатие, частью слоя
        while ((el = el.parentElement) && !(
            el.classList.contains(BackgroundLayer.Class) ||
            el.classList.contains(LabelLayer.Class)
        )) {}

        if (el) {
            evt.preventDefault();

            this._callContextMenu(this._menu, {x: evt.clientX, y: evt.clientY});
        }
    }
}