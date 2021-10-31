import '../styles/menu.css';
import ContextMenu from "../core/ContextMenu";
import { getAbsolutePosition } from '../core/extras/helpers';
import Grid from "../core/Grid";
import { XYObject } from "../core/types";
import Layer from '../core/Layer';

/**
 * Contains {@link ContextMenu}s called from other {@link Layer}s of the breadboard
 * 
 * Unlike most of the layers in the {@link Breadboard}, this layer is HTML-based. 
 * This is required because {@link ContextMenu}s renders HTML elements which can be mounted in HTML container only.
 * 
 * @category Breadboard
 * @subcategory Layers
 */
export default class MenuLayer extends Layer<HTMLDivElement> {
    /** CSS class of the layer */
    static get Class() {return "bb-layer-menu"}

    /** instance of context menu currently opened */
    private _menu: ContextMenu;

    /** local event handlers */
    private _callbacks: { ctxmenuitemclick: (item_id: number, alias: string, value: any) => void; };

    /**
     * Make sure to pass an HTML container when constructing the layer.
     * Since the other layers all in the SVG, make sure that the container 
     * is placed over entire SVG document in the DOM tree and visible to user.
     * The container should allow any interactions outside the content it creates, but
     * prevent any background interactions under that content. 
     */
    constructor(
        container: HTMLDivElement,
        grid: Grid,
        schematic: boolean = false,
        detailed: boolean = false,
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.classList.add(MenuLayer.Class);

        this._callbacks = {
            ctxmenuitemclick: undefined,
        };

        this._showMenu = this._showMenu.bind(this);

        this._menu = undefined;

        this._handleFreeClick = this._handleFreeClick.bind(this);
    }

    /**
     * Attaches global click event handler
     */
    compose() {
        document.addEventListener('mousedown', this._handleFreeClick, false);
    }

    /**
     * Attaches context menu item click event handler
     * 
     * Callback parameters:
     *  - item_id   optional id of the item, if applicable
     *  - alias     optional alias of the item type, if applicable
     *  - value     optional value if the item, if applicable
     * 
     * For example, if item is a {@link RheostatPlate}, its alias is 'switch' and its value is `100`.
     * 
     * @param cb callback function as a handler to attach
     */
    onContextMenuItemClick(cb: (item_id: number, alias: string, value: any) => void) {
        this._callbacks.ctxmenuitemclick = cb;
    }

    /**
     * Opens given {@link ContextMenu} instance
     *
     * @param menu      the menu instance to open
     * @param position  position of the mouse click
     * @param inputs    optional inputs of the item clicked
     */
    openMenu(menu: ContextMenu, position: XYObject, inputs: (string|number)[]) {
        this._hideMenu();

        if (menu) {
            if (!position) throw new Error("parameter 'position' is undefined");

            this._showMenu(menu, position, inputs)

            this._menu.onItemClick((item_id: number, alias: string, value: any) => {
                this._hideMenu();
                this._callbacks.ctxmenuitemclick && this._callbacks.ctxmenuitemclick(item_id, alias, value);
            });
        }
    }

    /**
     * Displays given {@link ContextMenu} instance
     * 
     * @param menu     the menu instance to open 
     * @param position position of the mouse click
     * @param inputs   optional inputs of the item clicked
     */
    _showMenu(menu: ContextMenu, position: XYObject, inputs: (string|number)[]) {
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

    /**
     * Hides {@link ContextMenu} instance currently displaying
     */
    _hideMenu() {
        if (this._menu) {
            const container = this._menu.container;

            this._menu.fadeOut(() => {
                this._container.removeChild(container);
            });

            this._menu = undefined;
        }
    }

    /**
     * Handles global document click event
     * 
     * @param evt global click event
     */
    _handleFreeClick(evt: MouseEvent) {
        // do not handle right-click events because it may block others modules to open menus
        if (evt.which === 3) return;

        let el = evt.target as Element;

        // detect if the element is the part of a menu
        while ((el = el.parentElement) && !(el.classList.contains(ContextMenu.Class))) {}

        if (!el) {
            // evt.preventDefault();
            this._hideMenu();
        }
    }
}