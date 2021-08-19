import '../styles/menu.css';
import Layer from "../core/Layer";
import ContextMenu from "../core/ContextMenu";
import { getAbsolutePosition } from '../core/extras/helpers';

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
    openMenu(menu, position, inputs) {
        this.hideMenu();

        if (menu) {
            if (!position) throw new Error("parameter 'position' is undefined");

            this.showMenu(menu, position, inputs)

            this._menu.onItemClick((item_id, alias, value) => {
                this.hideMenu();
                this._callbacks.ctxmenuitemclick && this._callbacks.ctxmenuitemclick(item_id, alias, value);
            });
        }
    }

    showMenu(menu, position, inputs, svg) {
        this._menu = menu;

        const container_menu = this._menu.draw(position, inputs);
        this._container.appendChild(container_menu);

        container_menu.style.left = position.x + 'px';
        container_menu.style.top = position.y + 'px';

        const {x: root_x0, y: root_y0} = getAbsolutePosition(this._container);
        const menu_x0 = position.x, menu_y0 = position.y;

        let dx = root_x0;
        let dy = root_y0;

        const root_x1 = this._container.offsetWidth + root_x0,
              root_y1 = this._container.offsetHeight + root_y0;

        const menu_x1 = container_menu.offsetWidth + menu_x0,
              menu_y1 = container_menu.offsetHeight + menu_y0;

        let {x: px, y: py} = position;

        if (menu_x0 < root_x0) px = (position.x + root_x0 - menu_x0);
        if (menu_x1 > root_x1) px = (position.x - menu_x1 + root_x1);

        if (menu_y0 < root_y0) py = (position.y + root_y0 - menu_y0);
        if (menu_y1 > root_y1) py = (position.y - menu_y1 + root_y1);

        container_menu.style.left = px - dx + 'px';
        container_menu.style.top = py - dy + 'px';
    }

    hideMenu() {
        if (this._menu) {
            const container = this._menu.container;

            this._menu.fadeOut(() => {
                this._container.removeChild(container);
            });

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