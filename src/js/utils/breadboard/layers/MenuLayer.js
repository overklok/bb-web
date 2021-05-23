import Layer from "js/utils/breadboard/core/Layer";

import '../styles/menu.css';
import ContextMenu from "js/utils/breadboard/core/ContextMenu";

export default class MenuLayer extends Layer {
    static get Class() {return "bb-layer-menu"}

    constructor(container, grid) {
        super(container, grid);

        this._container.classList.add(MenuLayer.Class);

        this._callbacks = {
            ctxmenuitemclick: undefined,
        };

        this.showMenu = this.showMenu.bind(this);

        this._menu = undefined;

        this._handleFreeClick = this._handleFreeClick.bind(this);
    }

    compose() {
        document.addEventListener('mousedown', this._handleFreeClick, false);
    }

    onContextMenuItemClick(cb) {
        this._callbacks.ctxmenuitemclick = cb;
    }

    /**
     *
     * @param {ContextMenu} menu
     * @param position
     * @param inputs
     */
    showMenu(menu, position, inputs) {
        this.hideMenu();

        if (menu) {
            if (!position) throw new Error("parameter 'position' is undefined");

            this._menu = menu;
            this._menu.draw(position, inputs);
            this._container.appendChild(this._menu.container);

            this._menu.onItemClick((item_id, alias, value) => {
                this.hideMenu();
                this._callbacks.ctxmenuitemclick && this._callbacks.ctxmenuitemclick(item_id, alias, value);
            });
        }
    }

    hideMenu() {
        if (this._menu) {
            this._container.removeChild(this._menu.container);
            this._menu = undefined;
        }
    }

    _handleFreeClick(evt) {
        // do not handle right-click events because it may block others modules to open menus
        if (evt.which === 3) return;

        let el = evt.target;

        // detect if the element is the part of a menu
        while ((el = el.parentElement) && !(el.classList.contains(ContextMenu.Class))) {}

        if (!el) {
            evt.preventDefault();
            this.hideMenu();
        }
    }
}