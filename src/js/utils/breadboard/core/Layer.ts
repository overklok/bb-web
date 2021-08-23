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
 * @category Breadboard
 */
export default abstract class Layer {
    /** SVG container that contains the {@link Layer} content */
    protected _container: SVG.Container;
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
        container: SVG.Container, 
        grid: Grid, 
        schematic: boolean = false, 
        detailed: boolean = false, 
        verbose: boolean = false
    ) {
        if (!container) {throw new TypeError("Container is not defined")}
        if (!grid) {throw new TypeError("Grid is not defined")}

        this._container = container;

        this.__grid = grid;

        this.__schematic = schematic;
        this.__detailed = detailed;
        this.__verbose = verbose;

        this._onctxmenucall = undefined;
    }

    /**
     * Deploys {@link Layer}'s general internal DOM structure
     * and optionally draw contents
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
        this._container.hide()
    }

    /**
     * Shows the layer
     */
    show(): void {
        this._container.show()
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
    protected _callContextMenu(menu: ContextMenu, position: XYObject, inputs: [] = []): void {
        this._onctxmenucall && this._onctxmenucall(menu, position, inputs);
    }

    /**
     * Clears all context menu deployed at the moment
     */
    protected _clearContextMenus(): void {
        this._onctxmenucall && this._onctxmenucall();
    }
}