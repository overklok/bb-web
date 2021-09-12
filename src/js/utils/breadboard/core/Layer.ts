import SVG from 'svg.js';

import ContextMenu from './ContextMenu';
import Grid from './Grid';
import { XYObject } from './types';

/**
 * Basic element of {@link Breadboard} layer system
 * 
 * Visually, Breadboard is a multi-layered composition, 
 * where each layer is responsible for some part of visual appearance, such a
 * background, cells, plates, currents etc.
 * 
 * {@link Layer} defines basic restrictions for each {@link Layer} inheritor to provide
 * a general interface to manage their lifecycle.
 * 
 * By default, the {@link Layer} uses an SVG container, so its content is SVG-based.
 * But this can be changed to another type via generic parameter. 
 * {@link Layer} is also HTML-aware. Inherit with generic parameter `CT` set to {@link HTMLElement}.
 * 
 * If you want to use another type of container, note that you may need to override some default methods 
 * such as {@link show} and {@link hide}.
 * 
 * @category Breadboard
 */
export default abstract class Layer<CT = SVG.Container> {
    /** SVG container that contains the {@link Layer} content */
    protected _container: CT;
    /** Reference to the {@link Grid}, it keeps all board options synced between the {@link Layer}s */
    protected __grid: Grid;

    /** Schematic mode flag */
    protected __schematic: boolean;
    /** Detailed mode flag */
    protected __detailed: boolean;
    /** Verbose mode flag */
    protected __verbose: boolean;

    /** Context menu call callback */
    private _onctxmenucall: any;

    /**
     * Prepares properties and modifies container as needed
     * 
     * @param container SVG container to draw the content in
     * @param grid      the {@link Grid} applied to the board
     * @param schematic enable schematic display mode (optional to use in children class)
     * @param detailed  enable detailed display mode (optional to use in children class)
     * @param verbose   display debug details (optional to use in children class)
     */
    constructor(
        container: CT,
        grid: Grid, 
        schematic: boolean = false, 
        detailed: boolean = false, 
        verbose: boolean = false
    ) {
        this._container = container;

        this.__grid = grid;

        this.__schematic = schematic;
        this.__detailed = detailed;
        this.__verbose = verbose;

        this._onctxmenucall = undefined;
    }

    /**
     * Deploys {@link Layer}'s general internal DOM structure
     * and optionally draws contents
     */
    abstract compose(): void;

    /**
     * Removes and {@link compose}s layer's content again with new options
     * 
     * @param schematic schematic mode flag
     * @param detailed  detailed mode flag
     * @param verbose   verbose mode flag
     */
    recompose(schematic: boolean, detailed: boolean = false, verbose: boolean = false): void {
        this.__schematic = schematic;
        this.__detailed = detailed;
        this.__verbose = verbose;
    }

    /**
     * Hides the layer
     */
    hide(): void {
        if (this._container.hasOwnProperty('hide')) {
            (this._container as unknown as SVG.Container).hide();
        } else if (this._container instanceof HTMLElement) {
            this._container.style.visibility = 'hidden';
        }
    }

    /**
     * Shows the layer
     */
    show(): void {
        if (this._container.hasOwnProperty('show')) {
            (this._container as unknown as SVG.Container).show();
        } else if (this._container instanceof HTMLElement) {
            this._container.style.visibility = 'visible';
        }
    }

    /**
     * Toggles layer visibility 
     * 
     * @param on 
     */
    toggle(on: boolean = true): void {
        if (on) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Attaches context menu call handler
     * 
     * @param cb callback handler
     */
    onContextMenuCall(cb: Function): void {
        this._onctxmenucall = cb;
    }

    /**
     * Handles context menu click
     *
     * @param menu      context menu instance
     * @param position  position of the click
     * @param inputs    inputs needed to provide to the menu
     *
     * @protected
     */
    protected _callContextMenu(menu: ContextMenu, position: XYObject, inputs: any[] = []): void {
        this._onctxmenucall && this._onctxmenucall(menu, position, inputs);
    }

    /**
     * Clears all context menu deployed at the moment
     */
    protected _clearContextMenus(): void {
        this._onctxmenucall && this._onctxmenucall();
    }
}