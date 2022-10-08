import SVG from 'svg.js';

import ContextMenu from './ContextMenu';
import Grid from './Grid';
import Popup, { PopupContent } from './Popup';
import { XYObject } from './types';

type PopupDrawCallback<C extends PopupContent> = (popup: Popup<C>, content: C) => void;
type PopupShowCallback = (popup: Popup<any>) => void;
type PopupHideCallback = (popup: Popup<any>) => void;
type PopupClearCallback = (popup: Popup<any>) => void;

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
    /** Popup draw callback */
    private _onpopupdraw: PopupDrawCallback<any>;
    /** Popup clear callback */
    private _onpopupclear: PopupClearCallback;
    /** Popup show callback */
    private _onpopupshow: PopupShowCallback;
    /** Popup hide callback */
    private _onpopuphide: PopupHideCallback;

    /** Popup registry */
    protected _popups: {[id: number]: Popup<any>};

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

        this._popups = {};

        this._onctxmenucall = undefined;
        this._onpopupshow = undefined;
        this._onpopuphide = undefined;
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
     * Attaches popup draw handler
     * 
     * @param cb callback handler
     */
    onPopupDraw(cb: PopupDrawCallback<any>): void {
        this._onpopupdraw = cb;
    }

    /** 
     * Attaches popup clear handler
     * 
     * @param cb callback handler
     */
    onPopupClear(cb: PopupClearCallback): void {
        this._onpopupclear = cb;
    }
    /** 
     * Attaches popup show handler
     * 
     * @param cb callback handler
     */
    onPopupShow(cb: PopupShowCallback): void {
        this._onpopupshow = cb;
    }

    /** 
     * Attaches popup hide handler
     * 
     * @param cb callback handler
     */
    onPopupHide(cb: PopupHideCallback): void {
        this._onpopuphide = cb;
    }

    /**
     * Handles context menu call request
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

    /**
     * Handles popup draw request with specified content
     * 
     * @param popup     popup instance
     */
    protected _requestPopupDraw<C extends PopupContent>(popup: Popup<C>, content: C): void {
        this._onpopupdraw && this._onpopupdraw(popup, content);
    }

    /**
     * Handles popup clear request
     * 
     * @param popup     popup instance
     */
    protected _requestPopupClear(popup: Popup<any>): void {
        this._onpopupclear && this._onpopupclear(popup);
    }

    /**
     * Handles popup show request
     * 
     * @param popup     popup instance
     */
    protected _requestPopupShow<C extends PopupContent>(popup: Popup<C>): void {
        this._onpopupshow && this._onpopupshow(popup);
    }

    /**
     * Handles popup hide request
     * 
     * @param popup     popup instance
     */
    protected _requestPopupHide<C extends PopupContent>(popup: Popup<C>): void {
        this._onpopuphide && this._onpopuphide(popup);
    }

    /**
     * Clears all popups deployed at the moment
     */
    protected _clearPopups(): void {
        for (const [key, popup] of Object.entries(this._popups)) {
            this._onpopupclear && this._onpopupclear(popup);
        }
        this._popups = {};
    }
}