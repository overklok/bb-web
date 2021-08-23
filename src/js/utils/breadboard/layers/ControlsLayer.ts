import SVG from "svg.js";
import Layer from "../core/Layer";
import BackgroundLayer from "~/js/utils/breadboard/layers/BackgroundLayer";
import LabelLayer from "~/js/utils/breadboard/layers/LabelLayer";
import BoardContextMenu from "~/js/utils/breadboard/menus/BoardContextMenu";
import Grid from "../core/Grid";
import ContextMenu from "../core/ContextMenu";

/**
 * The {@link Layer} that displays menu button and handles events to
 * open the {@link BoardContextMenu}
 */
export default class ControlsLayer extends Layer {
    private _menu: ContextMenu;
    private _buttongroup: any;
    /** CSS class of the layer */
    static get Class() {return "bb-layer-controls"}

    /** HTML menu button id */
    static get MenuButtonId() {return "bb-btn-menu"}

    private _callbacks: { menuclick: () => void; };

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

        this.setLayoutConfig();

        this._handleContextMenu = this._handleContextMenu.bind(this);

        this._menu = new BoardContextMenu();
    }

    setLayoutConfig(config: { horz?: any; } = {}) {
        config = config || {};
    }

    compose() {
        this._buttongroup = this._container.nested().id(ControlsLayer.MenuButtonId);

        document.addEventListener('contextmenu', this._handleContextMenu, false);
        // document.addEventListener('keyup', this.handleKey, false);
        this._drawMenuButton();

        this._hide();
    }

    addContextMenuItem(alias: string, label: string, active: boolean = true) {
        this._menu.addItem(alias, label, active);
    }

    setVisibility(is_visible: boolean) {
        is_visible ? this._show() : this._hide();
    }

    toggleButtonDisplay(on=true) {
        if (on) {
            this._buttongroup.show();
        } else {
            this._buttongroup.hide();
        }
    }

    onMenuClick(cb: () => void) {
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
    _handleContextMenu(evt: MouseEvent) {
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