import SVG from "svg.js";
import Layer from "../core/Layer";
import BackgroundLayer from "~/js/utils/breadboard/layers/BackgroundLayer";
import LabelLayer from "~/js/utils/breadboard/layers/LabelLayer";
import BoardContextMenu from "~/js/utils/breadboard/menus/BoardContextMenu";
import Grid from "../core/Grid";
import ContextMenu from "../core/ContextMenu";

/**
 * Displays menu button and handles events to
 * open the {@link BoardContextMenu}
 */
export default class ControlsLayer extends Layer {
    /** CSS class of the layer */
    static get Class() {return "bb-layer-controls"}

    /** HTML menu button id */
    static get MenuButtonId() {return "bb-btn-menu"}

    /** Board context menu instance that is currently visible */
    private _menu: ContextMenu;

    /** SVG group for button details */
    private _buttongroup: any;

    /** Event handlers */
    private _callbacks: { menuclick: () => void; };

    /**
     * @inheritdoc 
     */
    constructor(
        container: SVG.Container, 
        grid: Grid, 
        schematic=false, 
        detailed=false, 
        verbose=false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.addClass(ControlsLayer.Class);

        this._callbacks = {
            menuclick: () => {}
        };

        this._handleContextMenu = this._handleContextMenu.bind(this);

        this._menu = new BoardContextMenu();
    }

    /**
     * Draws contents for the layer
     */
    public compose() {
        this._buttongroup = this._container.nested().id(ControlsLayer.MenuButtonId);

        document.addEventListener('contextmenu', this._handleContextMenu, false);
        // document.addEventListener('keyup', this.handleKey, false);
        this._drawMenuButton();

        this._hide();
    }

    /** 
     * Adds an item to the board context menu 
     * 
     * This method is useful to add some extra items to the menu,
     * such as options to switch the board layout, which can be added
     * eventually, so they cannot be defined at the initialization step
     */
    public addContextMenuItem(alias: string, label: string, active: boolean = true) {
        this._menu.addItem(alias, label, active);
    }

    /**
     * Toggles the appearance of the layer
     * 
     * Controls are needed only when managing the board's contents,
     * but it needs to be disabled for end users.
     * 
     * @param is_visible whether to make the layer visible
     */
    public setVisibility(is_visible: boolean) {
        is_visible ? this._show() : this._hide();
    }

    /**
     * Toggles the appearance of the menu button
     * 
     * @param on 
     */
    public toggleButtonDisplay(on=true) {
        if (on) {
            this._buttongroup.show();
        } else {
            this._buttongroup.hide();
        }
    }

    /**
     * Attaches a handler of the menu click event
     * 
     * @param cb callback function as a handler to attach
     */
    public onMenuClick(cb: () => void) {
        if (!cb) {this._callbacks.menuclick = () => {}; return}

        this._callbacks.menuclick = cb;
    }

    /**
     * Draws the menu button to the layer
     */
    private _drawMenuButton() {
        this._buttongroup
            .click(() => this._callbacks.menuclick())
            .style({cursor: 'pointer'});

        this._buttongroup.rect(30, 25).move(20, 20).fill({color: '#afafaf'});

        this._buttongroup.rect(30, 5).move(20, 20);
        this._buttongroup.rect(30, 5).move(20, 30);
        this._buttongroup.rect(30, 5).move(20, 40);
    }

    private _show() {
        this._buttongroup.show();
    }

    private _hide() {
        this._buttongroup.hide();
    }

    /**
     * Handles mouse clicks on the board background to call the context menu
     * 
     * The handler prevents the opening of the system menu
     * 
     * @param {MouseEvent} evt
     */
    private _handleContextMenu(evt: MouseEvent) {
        let el = evt.target as Element;

        /// Определить, является ли элемент, по которому выполнено нажатие, частью слоя
        while ((el = el.parentElement) && !(
            el.classList.contains(BackgroundLayer.Class) ||
            el.classList.contains(LabelLayer.Class)
        )) {}

        if (el) {
            evt.preventDefault();

            this._callContextMenu(this._menu, {x: evt.pageX, y: evt.pageY});
        }
    }
}