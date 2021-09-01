import SVG from 'svg.js'
import cloneDeep from "lodash/cloneDeep";
import defaultsDeep from "lodash/defaultsDeep";
import isEqual from 'lodash/isEqual';

import Cell from "./Cell";
import Grid, { BorderType } from "./Grid";
import PlateContextMenu from "../menus/PlateContextMenu";
import {coverObjects, mod} from "./extras/helpers";
import BackgroundLayer from "../layers/BackgroundLayer";
import {Direction, DirsClockwise, XYObject} from "./types";
import ContextMenu from './ContextMenu';

/**
 * Orientation codes
 *
 * @type {{West: string, North: string, East: string, South: string}}
 */
const ORIENTATIONS = {
    West:   'east',
    North:  'north',
    East:   'west',
    South:  'south',
    Dummy:  'dummy',
};

const QUAD_SIZE_DEFAULT = 24,
      LED_SIZE_DEFAULT = 16,
      LABEL_FONT_SIZE_DEFAULT = 16;

let QUAD_SIZE = QUAD_SIZE_DEFAULT,
    LED_SIZE = LED_SIZE_DEFAULT,
    LABEL_FONT_SIZE = LABEL_FONT_SIZE_DEFAULT;

export type PlateRef<P extends Plate> = new (...args: any) => P;

/**
 * Dynamic (modifiable) plate attributes 
 */
export type PlateState = {
    /** cell defining the position of the plate */
    cell: Cell; 
    /** current orientation of the plate */
    orientation: string; 
    /** is the plate highlighed at the moment */
    highlighted: boolean; 
    /** plate currents */
    currents: any;
    /** plate voltages */
    voltages: any;
    /** input value */
    input: any;
    /** output value */
    output: any;
}

/**
 * Static (non-modifiable) plate type attributes
 */
export type PlateParams = {
    /** the number of cells occupied by the plate on the board  */
    size: { x: number; y: number; }; 
    /** physical plate size (px) */
    size_px: { x: number; y: number; }; 
    /** pivot point of the plate */
    origin: { x: number; y: number; }; 
    /** full set of points defining the surface of the plate */
    surface: XYObject[]; 
    /** {@link Current} adjustments for each of the relative positions of cells occupied */
    rels: {
        /** horizontal index of the cell */
        x: number,
        /** vertical index of the cell */
        y: number,
        adj: { 
            /** horizontal adjustment for the current flowing through the cell */
            x: number, 
            /** vertical adjustment for the current flowing through the cell */
            y: number 
        }
    }[];
    /** plate position adjustments */
    adjs: { [orientation: string]: XYObject }; 
    /** whether schematic style is turned on */
    schematic: boolean; 
    /** whether debug data should be displayed */
    verbose: boolean;
}

/**
 * Static (non-modifiable) plate instance attributes
 */
export type PlateProps = { [key: string]: number|string };

/**
 * Data object defining the position and orientation of the plate
 */
export type SerializedPlatePosition = {
    cell: XYObject;
    orientation: string;
}

/**
 * Data object that defines the full set of plate attributes
 */
export type SerializedPlate = {
    id: number;
    type: string;
    length: number;
    position: SerializedPlatePosition;
    properties: PlateProps;
    dynamic: {
        input: any;
        output: any;
    }
}

/**
 * Renders a plate, provides an API to manage its state 
 *
 * @category Breadboard
 */
export default abstract class Plate {
    static get PROP_INVERTED() { return "inv" }

    /** Plate orientations */
    static get Orientations() { return ORIENTATIONS }

    /** SVG container for the plate */
    static get Class() { return "bb-plate" }
    
    /** Plate type string descriptor, used to instantiate plates from serialized data */
    static get Alias() { return "default" }

    /** CSS class for shadow iwage */
    static get ShadowImgClass() { return "bb-plate-shadow-img" }

    /** Font family for plate captions */
    static get CaptionFontFamily() { return "'IBM Plex Mono', 'Lucida Console', Monaco, monospace" }
    /** Font weight for plate captions */
    static get CaptionFontWeight() { return "normal" }

    /** Default size for square elements used in plate pictograms */
    static get QuadSizeDefault() { return QUAD_SIZE_DEFAULT }
    /** Default size for LED elements used in plate pictograms */
    static get LEDSizeDefault() { return LED_SIZE_DEFAULT }
    /** Font size for plate captions */
    static get LabelFontSizeDefault() { return LABEL_FONT_SIZE_DEFAULT }

    /** Preferred size for square elements used in plate pictograms */
    static get QuadSizePreferred() { return QUAD_SIZE };
    /** Preferred size for LED elemets used in plate pictograms */
    static get LEDSizePreferred() { return LED_SIZE };
    /** Preferred font size for plate captions */
    static get LabelFontSizePreferred() { return LABEL_FONT_SIZE };
    
    /** Sets preferred size for square elemets used in plate pictograms */
    static set QuadSizePreferred(v) { QUAD_SIZE = v };
    /** Sets preferred size for LED elements used in plate pictograms */
    static set LEDSizePreferred(v) { LED_SIZE = v };
    /** Sets preferred font size for plate captions */
    static set LabelFontSizePreferred(v) { LABEL_FONT_SIZE = v };

    /** extra purpose flag */
    public ___touched: boolean;

    /** grid on which the plate is placed */
    protected __grid: Grid;
    /** static plate type attributes */
    protected _params: PlateParams;
    /** static plate instance attributes, evaluates from {@link __defaultProps__}, takes its values from the constructor argument `props` */
    protected _props: PlateProps;
    /** dynamic plate instance attributes, changes via {@link setState} */
    protected _state: PlateState;
    
    /** plate identifier */
    private _id: number;
    /** plate type string descriptor */
    private _alias: string;

    /** SVG container in which the plate is rendered */
    protected _container: SVG.Nested;
    /** SVG container in which the plate is rotated */
    protected _group: SVG.G;
    /** plate outline element */
    protected _bezel: SVG.Path | SVG.Rect;
    /** SVG element of the plate shadow, showing the estimated closest location to move in case of drag interruption */
    private _shadowimg: SVG.Rect;
    /** SVG container in which the plate shadow is rendered */
    private _shadow: SVG.Nested;
    /** SVG container in which the plate shadow is rotated */
    private _shadowgroup: SVG.G;
    /** SVG element that highlights the plate */
    private _error_highlighter: any;
    /** parent node of plate container */
    private _node_parent: HTMLElement;

    /** a flag that determines if the plate is in the dragging state */
    private _dragging: boolean;
    /** is the plate is drawn or not */
    private _drawn: boolean;
    /** the cell that is currently defined as the closest to drop to if the dragging is interrupted */
    private _cell_supposed: any;
    /** plate placement constraints */
    private _constraints: any;
    
    /** local event handlers */
    private _callbacks: {
        /** plate changes */
        change: CallableFunction; 
        /** mouse button is clicked on the plate */
        mousedown: CallableFunction;
        /** mouse wheel is scrolled on the plate */
        mousewheel: CallableFunction;
        /** plate dragging is started */
        dragstart: CallableFunction;
        /** plate dragging is finished */
        dragfinish: CallableFunction;
    };
    
    private _dir_prev: any;

    /**
     * Deploys SVG tree for the plate, sets all attributes to its initial state
     */
    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic = false,
        verbose = false,
        id?: number,
        props?: PlateProps
    ) {
        if (!container || !grid) {
            throw new TypeError("Both of container and grid arguments should be specified");
        }

        this.__grid = grid;

        this._node_parent = container.node;

        /// Plate type code name
        this._alias = (this as any).constructor.Alias;

        /// Identifier is random number by default
        this._id = (id === null) ? (Math.floor(Math.random() * (10 ** 6))) : (id);

        /// Structural elements of SVG tree
        this._shadow = container.nested();        // for shadow 
        this._container = container.nested();     // for plate rendering and scale transformationa
        this._shadowgroup = this._shadow.group(); // for shadow rotations
        this._group = this._container.group();    // for plate rotations

        this._bezel = undefined; // plate outline (repeats plate shape with a bold stroke and without filling)

        /// Additional containers
        this._error_highlighter = undefined;        // colored overlay of the same shape

        /// Set initial static plate type attributes
        this._params = {
            size: { x: 0, y: 0 },       
            size_px: { x: 0, y: 0 },    
            origin: { x: 0, y: 0 },     
            surface: undefined,         
            rels: undefined,            
            adjs: undefined,            
            schematic: schematic,       
            verbose: verbose,           
        };

        /// Take plate's default instance attributes
        this._props = this.__defaultProps__;

        /// Apply its values from the argument
        if (props) {
            this.__setProps__(props);
        }

        /// Set inital dynamic plate attributes
        this._state = {
            cell: new Cell(0, 0, this.__grid),    // ячейка, задающая положение опорной точки
            orientation: Plate.Orientations.East,        // ориентация плашки
            highlighted: false,                          // подсвечена ли плашка
            currents: undefined,
            voltages: undefined,
            input: undefined,
            output: undefined,
        };

        /// Assign a class to the container
        this._container.addClass(Plate.Class);

        /// Set initial event handlers
        this._callbacks = {
            change: () => { },           // изменения плашки
            mousedown: () => { },
            mousewheel: () => { },
            dragstart: () => { },
            dragfinish: () => { },
        };

        /// By default, plate is not dragged
        this._dragging = false;
        /// The plate will be drawn by the `__draw__` method
        this._drawn = false;

        /// Attach mousedown handler calls
        this._group.mousedown((evt: MouseEvent) => { this._callbacks.mousedown(evt) });

        /// Attach mousewheel handler calls
        if ('onwheel' in document) {
            // IE9+, FF17+, Ch31+
            this._group.node.addEventListener("wheel", (evt) => this._callbacks.mousewheel(evt), { passive: true });
        } else if ('onmousewheel' in document) {
            // устаревший вариант события
            this._group.node.addEventListener("mousewheel", (evt) => this._callbacks.mousewheel(evt));
        } else {
            // Firefox < 17
            this._group.node.addEventListener("MozMousePixelScroll", (evt) => this._callbacks.mousewheel(evt));
        }
    }

    /**
     * @returns plate type alias
     */
    public get alias(): string {
        return (this as any).constructor.Alias;
    }

    /**
     * @returns plate subtype 
     */
    public get variant(): string {
        return '';
    }

    /**
     * @returns plate identifier 
     */
    public get id(): number {
        return this._id;
    }

    /**
     * @returns main cell coordinates
     */
    public get pos(): XYObject {
        return this._state.cell.idx;
    }

    /**
     * @returns plate length (useful for LED strips and bridges)
     */
    public get length(): number {
        return this._params.size.x;
    }

    /**
     * @returns current flow adjustments for the cells occupied by the plate
     */
    public get rels() {
        return this._params.rels;
    }

    /**
     * @returns the location of the cells occupied by the plate
     */
    public get surface() {
        return this._params.surface;
    }

    /**
     * @returns static plate instance attributes
     */
    public get props(): PlateProps {
        return this._props;
    }

    /**
     * @returns dynamic plate instance attributes
     */
    public get state(): PlateState {
        return this._state;
    }

    /**
     * @returns current plate input value
     */
    public get input(): any {
        return this._state.input || 0;
    }

    /**
     * @returns HTML element that contains the plate SVG tree
     */
    public get container(): SVG.Nested {
        return this._container;
    }

    /**
     * @returns default properties and its values
     * 
     * If some property is not defined here, its value will be ignored when constructing the plate.
     */
    protected get __defaultProps__(): PlateProps {
        return {
            [Plate.PROP_INVERTED]: 0
        };
    }

    /**
     * @returns context menu class
     */
    protected get __ctxmenu__(): typeof ContextMenu {
        return PlateContextMenu;
    }

    /**
     * Draws plate contents
     */
    protected abstract __draw__(cell: Cell, orientation: string): void

    /**
     * Finds "opposite" cell, in terms of current input and output 
     *
     * If {@link cell} is an element input cell, then the method returns an output cell and vice versa.
     * If there are no opposite cell for given cell, then the function returns `undefined`.
     *
     * @param cell an input/output cell
     * 
     * @returns an output cell, if an input cell is provided, and vice versa 
     */
    protected abstract _getOppositeCell(cell: Cell): Cell 

    /**
     * Sets new props for the plate
     * 
     * Props that is not defined by {@link __defaultProps__} will be ignored here.
     *  
     * @param props partial props for the plate with values needed to set
     */
    protected __setProps__(props: Partial<PlateProps>) {
        this._props = coverObjects(props, this._props);
    }

    /**
     * @returns a context menu instance for the plate
     */
    public getCmInstance() {
        return new this.__ctxmenu__(this.id, this.alias, this.variant);
    }

    /**
     * @returns serialized data object defining all the data needed to represent the plate
     */
    public serialize(): SerializedPlate {
        return {
            id: this.id,
            type: this.alias,
            length: this.length,

            position: {
                cell: {
                    x: this.pos.x,
                    y: this.pos.y
                },
                orientation: this.state.orientation
            },
            properties: this.props,
            dynamic: {
                input: this.state.input,
                output: this.state.output,
            }
        }
    }

    /**
     * Draws the surface of the plate and its contents in the given position and orientation
     *
     * @param cell        element's position relative to its pivot point
     * @param orientation element's orientation relative to it's pivot point
     * @param animate     animate plate appearance
     */
    public draw(cell: Cell, orientation: string, animate: boolean = false) {
        this._checkParams();

        this._beforeReposition();

        let width = (cell.size.x * this._params.size.x) + (this.__grid.gap.x * 2 * (this._params.size.x - 1));
        let height = (cell.size.y * this._params.size.y) + (this.__grid.gap.y * 2 * (this._params.size.y - 1));

        this._container.size(width, height);
        this._shadow.size(width, height);

        let surf_path = this._generateSurfacePath(BackgroundLayer.CellRadius);

        // TODO: Move surface generation to ComplexPlate and LinearPlate

        if (surf_path) {
            this._bezel = this._group.path(surf_path);
            this._error_highlighter = this._group.path(surf_path);
        } else {
            this._bezel = this._group.rect().width('100%').height('100%').radius(BackgroundLayer.CellRadius);
            this._error_highlighter = this._group.rect().width('100%').height('100%').radius(BackgroundLayer.CellRadius);
        }

        if (this._params.schematic) {
            this._bezel.fill({ opacity: 0 }).stroke({ opacity: 0 });
        } else {
            this._bezel.fill("#fffffd").stroke({ color: "#f0eddb", width: 2 });
        }

        this._error_highlighter.fill({ color: "#f00" });

        this._shadowimg = this._shadowgroup.rect(width, height); // изображение тени
        this._shadowimg.fill({ color: "#51ff1e" }).radius(10).opacity(0.4);
        this._shadowimg.addClass(Plate.ShadowImgClass);
        this._hideShadow();

        this.highlightError(false);
        this.move(cell, true);
        this.rotate(orientation, true, false);
        this._preventOverflow(true);
        this.__draw__(cell, orientation);

        this._drawn = true;

        this._params.size_px.x = width;
        this._params.size_px.y = height;

        if (animate) {
            this._bezel.scale(1.15).animate(100).scale(1);
        }

        this._afterReposition();
    };

    /**
     * Sets plate state 
     *
     * @param state             new state of the plate to be updated
     * @param suppress_events   log errors instead of throwing exceptions
     */
    public setState(state: Partial<PlateState>, suppress_events=false) {
        const is_dirty = !isEqual(this._state, state);

        this._state = defaultsDeep(cloneDeep(state), this._state);

        if (!suppress_events) {
            if (is_dirty) {
                this._callbacks.change({
                    id: this._id,
                    action: 'state'
                });
            }
        }
    }

    /**
     * Toggles error highlight 
     *
     * @param on turn on the highlight
     */
    public highlightError(on=false) {
        if (on) {
            this._error_highlighter.opacity(0.3);
        } else {
            this._error_highlighter.opacity(0);
        }
    }

    /**
     * Triggers plate click event
     */
    public click() {
        this._container.fire('mousedown');
        this._rearrange();
    }

    /**
     * Moves the plate to a new cell
     *
     * @param cell            position of the plate relative to its pivot point
     * @param suppress_events log errors instead of throwing exceptions
     * @param animate         animate the movement
     */
    public move(cell: Cell, suppress_events: boolean = false, animate: boolean = false) {
        if (cell.grid !== this.__grid) {
            throw new Error("Cell's grid and plate's grid are not the same");
        }

        if (!suppress_events) {
            this._beforeReposition();
        }

        this._state.cell = cell;

        let pos = this._getPositionAdjusted(cell);

        this._shadow.move(pos.x, pos.y);

        if (animate) {
            this._container.animate(100, '<>').move(pos.x, pos.y);
        } else {
            this._container.move(pos.x, pos.y);
        }

        if (!suppress_events) {
            this._afterReposition();

            this._callbacks.change({
                id: this._id,
                action: 'move'
            });
        }
    }

    /**
     * Moves the plate (dx, dy) steps 
     *
     * @param dx                  the number of steps to move horizontally
     * @param dy                  the number of steps to move vertically
     * @param prevent_overflow    prevent movements outside the grid
     */
    public shift(dx: number, dy: number, prevent_overflow: boolean = true) {
        this.move(this.__grid.cell(this._state.cell.idx.x + dx, this._state.cell.idx.y + dy, BorderType.Replicate));

        if (prevent_overflow) {
            this._preventOverflow();
        }
    }

    /**
     * Rotates the plate
     *
     * @param orientation         orientation of the plate relative to pivot point
     * @param suppress_events     do not make preprocessing and postprocessing calls
     * @param prevent_overflow    prevent movements outside the grid
     */
    public rotate(orientation: string, suppress_events: boolean = false, prevent_overflow: boolean = true) {
        if (this._dragging) return;

        if (orientation === this._state.orientation) {return}

        if (orientation === Plate.Orientations.Dummy) {
            console.debug('invalid orientation: dummy');
            return;
        }

        if (!suppress_events) {
            this._beforeReposition();
        }

        let angle = Plate._orientationToAngle(orientation);

        let cell = this._state.cell;

        let anchor_point = {
            x: (this._params.origin.x * (this.__grid.gap.x * 2 + cell.size.x)) + (cell.size.x / 2),
            y: (this._params.origin.y * (this.__grid.gap.y * 2 + cell.size.y)) + (cell.size.y / 2),
        };

        this._group.transform({rotation: angle, cx: anchor_point.x, cy: anchor_point.y});
        this._shadowgroup.transform({rotation: angle, cx: anchor_point.x, cy: anchor_point.y});

        this._state.orientation = orientation;

        if (!suppress_events) {
            this._afterReposition();

            this._callbacks.change({
                id: this._id,
                action: 'rotate'
            })
        }

        if (prevent_overflow) {
            this._preventOverflow();
        }
    }

    /**
     * Rotates the plate clockwise
     */
    public rotateClockwise() {
        let orientation;

        switch (this._state.orientation) {
            case Plate.Orientations.East: {orientation = Plate.Orientations.North; break}
            case Plate.Orientations.South: {orientation = Plate.Orientations.East; break}
            case Plate.Orientations.West: {orientation = Plate.Orientations.South; break}
            case Plate.Orientations.North: {orientation = Plate.Orientations.West; break}

            default: {throw new TypeError("Current orientation is invalid")}
        }

        this.rotate(orientation);
    }

    /**
     * Rotates the plate counterclockwise
     */
    public rotateCounterClockwise() {
        let orientation;

        switch (this._state.orientation) {
            case Plate.Orientations.East: {orientation = Plate.Orientations.South; break}
            case Plate.Orientations.South: {orientation = Plate.Orientations.West; break}
            case Plate.Orientations.West: {orientation = Plate.Orientations.North; break}
            case Plate.Orientations.North: {orientation = Plate.Orientations.East; break}

            default: {throw new TypeError("Current orientation is invalid")}
        }

        this.rotate(orientation);
    }

    /**
     * Increases input value
     */
    public inputIncrement() {
        this.setState({input: Number(this.input) + 1});
    }

    /**
     * Decreases input value
     */
    public inputDecrement() {
        this.setState({input: Number(this.input) - 1});
    }

    /**
     * Highlights plate's outline 
     */
    public select() {
        this._rearrange();

        if (this._params.schematic) {
            (this._bezel.animate(100) as any).stroke({opacity: 1, color: "#0900fa", width: 2});
        } else {
            (this._bezel.animate(100) as any).stroke({color: "#0900fa", width: 2});
        }

        this.highlightError(false);
    }

    /**
     * Removes the highlight from the plate's outline
     */
    public deselect() {
        if (this._params.schematic) {
            (this._bezel.animate(100) as any).stroke({opacity: 0, color: "#f0eddb", width: 2});
        } else {
            (this._bezel.animate(100) as any).stroke({color: "#f0eddb", width: 2});
        }
    }

    /**
     * Removes plate's SVG tree
     */
    public dispose() {
        this._beforeReposition();

        // this._bezel.scale(1).animate('100ms').scale(0.85).opacity(0);

        // setTimeout(() => {
        this._container.node.remove();
        this._shadow.node.remove();
        // }, 100);

        this._afterReposition();
    }

    /**
     * Handles key press
     * 
     * @param key_code  code of the key pressed
     * @param keydown   is the button pressed or released 
     */
    public handleKeyPress(key_code: any, keydown: boolean) { }

    /**
     * Attaches user plate change event handler
     *
     * @param cb plate change event handler
     */
    public onChange(cb: CallableFunction) {
        if (!cb) {cb = () => {}}

        this._callbacks.change = cb;
    }

    /**
     * Attaches plate drag start event handler
     *
     * @param cb plate drag start event handler
     */
    public onDragStart(cb: CallableFunction) {
        if (!cb) {this._callbacks.dragstart = () => {}; return}

        this._callbacks.dragstart = cb;
    }

    /**
     * Attaches plate drag end event handler 
     *
     * @param cb plate drag end event handler 
     */
    public onDragFinish(cb: CallableFunction) {
        if (!cb) {this._callbacks.dragfinish = () => {}; return}

        this._callbacks.dragfinish = cb;
    }

    /**
     * Attaches plate click event handler
     * 
     * @param cb plate click event handler
     */
    public onMouseDown(cb: CallableFunction) {
        if (!cb) {this._callbacks.mousedown = () => {}; return}

        this._callbacks.mousedown = cb;
    }

    /**
     * Attaches plate scroll event handler
     * 
     * @param cb plate scroll event handler
     */
    public onMouseWheel(cb: CallableFunction) {
        if (!cb) {this._callbacks.mousewheel = () => {}; return}

        this._callbacks.mousewheel = cb;
    }

    /**
     * Makes the plate translucent and unresponsive
     *
     * Plate does not trigger mouse events and becomes translucent.
     * This is necessary to prevent interaction conflicts while dragging.
     */
    public freeze() {
        this._container.style('pointer-events', 'none');
        this._container.animate(100).attr({ 'opacity': 0.5 });
    }

    /**
     * Cancels freezing
     * 
     * Plate triggers mouse events and becomes opaque.
     *
     * {@see Plate.freeze}
     */
    public unfreeze() {
        this._container.style('pointer-events', 'inherit');
        this._container.animate(100).attr({ 'opacity': 1 });
    }

    /**
     * Toggles plate editability
     * 
     * The method just changes the visual behavior of the plate
     * without preventing the actions associated with editing.
     * 
     * @param editable make plate editable
     */
    public setEditable(editable=true) {
        if (editable) {
            this._container.style({cursor: 'move'});
        } else {
            this._container.style({cursor: 'default'});
        }
    }

    /**
     * Moves the pivot point of the plate to the nearest accessible cell
     * 
     * The calculation of the nearest cell is based on the {@link _calcSupposedCell} method.
     */
    public snap() {
        if (!this._cell_supposed) {
            this._cell_supposed = this._calcSupposedCell();
        }

        this.move(this._cell_supposed, false, true);

        this._hideShadow();

        this._dragging = false;
        this._cell_supposed = undefined;
        this._callbacks.dragfinish();
    }

    /**
     * Moves the plate to the arbitrary point in the document
     * 
     * @param x         x position of the point
     * @param y         y position of the point
     * @param animate   whether to animate the movement
     */
    public move_to_point(x: number, y: number, animate: boolean = false) {
        if (animate) {
            this._container.animate(100, '<>').move(x, y);
        } else {
            this._container.move(x, y);
        }
    }

    /**
     * Moves the plate's center to the arbitrary point in the document
     * 
     * @param x         x position of the point
     * @param y         y position of the movement
     * @param animate   whether to animate the movement
     */
    public center_to_point(x: number, y: number, animate: boolean = false) {
        if (animate) {
            this._container.animate(100, '<>').center(x, y);
        } else {
            this._container.center(x, y);
        }
    }

    /**
     * Moves the plate by the specified number of units
     * 
     * @param dx number of units to move horizontally
     * @param dy number of units to move vertically
     */
    public dmove(dx: number, dy: number) {
        this._container.dmove(dx, dy);

        requestAnimationFrame(() => {
            this._cell_supposed = this._calcSupposedCell();
            this._dropShadowToCell(this._cell_supposed);
        })

        if (!this._dragging) {
            this._showShadow();
            this._callbacks.dragstart();
            this._dragging = true;
        }
    }

    /**
     * Tests parameters values of the plate type
     */
    private _checkParams() {
        if (this._params.origin.x >= this._params.size.x || this._params.origin.y >= this._params.size.y) {
            this._params.origin = {x: 0, y: 0};
            console.debug(`Invalid origin for plate type '${this._alias}'`);
        }
    }

    /**
     * Moves the shadow to supposed nearest cell
     */
    private _dropShadowToCell(cell: Cell) {
        let pos = this._getPositionAdjusted(cell);

        this._shadow.x(pos.x);
        this._shadow.y(pos.y);
    }

    /**
     * Shows the plate's shadow
     */
    private _showShadow() {
        this._shadow.opacity(1);
    }

    /**
     * Hides the plate's shadow
     */
    private _hideShadow() {
        this._shadow.opacity(0);
    }

    /**
     * Calculates the estimated nearest cell
     * 
     * This method is used to position the plates precisely 
     * by snapping them to the grid cells when dragging finishes.
     */
    private _calcSupposedCell() {
        /// Положениие группы плашки (изм. при вращении)
        let gx = this._group.x(),
            gy = this._group.y();

        /// Положение контейнера плашки (изм. при перемещении)
        let cx = this._container.x(),
            cy = this._container.y();

        /// Размер контейнера плашки
        let spx = this._params.size_px.x,
            spy = this._params.size_px.y;

        /// Координаты верхнего левого угла контейнера
        let x = 0,
            y = 0;

        // Учесть влияние вращения на систему координат
        switch (this._state.orientation) {
            case Plate.Orientations.East:   {x = cx;                y = cy;             break;}
            case Plate.Orientations.North:  {x = cx + gx - spy;     y = cy + gy;        break;}
            case Plate.Orientations.West:   {x = cx + gx - spx;     y = cy + gy - spy;  break;}
            case Plate.Orientations.South:  {x = cx + gx;           y = cy + gy - spx;  break;}
        }

        /// Клетка, над которой находится верхняя левая ячейка плашки
        let cell = this.__grid.getCellByPos(x, y, BorderType.Replicate);
        /// Клетка, над которой находится опорная ячейка плашки
        let cell_orig = this._getCellOriginal(cell);

        /// Ограничения для левой верхней ячейки плашки
        let [Ox, Oy, Nx, Ny] = this._getPlacementConstraints(this._state.orientation);

        /// Индекс ячейки, находящейся под опорной ячейкой плашки
        let ix = cell_orig.idx.x,
            iy = cell_orig.idx.y;

        /// Точное положение опорной точки плашки в системе координат
        let px = x - cell.pos.x + cell_orig.pos.x,
            py = y - cell.pos.y + cell_orig.pos.y;

        /// Проверка на выход за границы сетки ячеек
        if (ix <= Ox)   {ix = Ox}
        if (iy <= Oy)   {iy = Oy}

        if (ix >= Nx)   {ix = Nx}
        if (iy >= Ny)   {iy = Ny}

        /// Массив соседей ячейки, над которой находится плашка
        let neighbors = [];

        /// Соседи по краям
        if (ix + 1 <= Nx)    neighbors.push(this.__grid.cell(ix + 1, iy));
        if (ix - 1 >= Ox)   neighbors.push(this.__grid.cell(ix - 1, iy));
        if (iy + 1 <= Ny)    neighbors.push(this.__grid.cell(ix, iy + 1));
        if (iy - 1 >= Oy)   neighbors.push(this.__grid.cell(ix, iy - 1));

        /// Соседи по диагоналям
        if (ix + 1 <= Nx && iy + 1 <= Ny)     neighbors.push(this.__grid.cell(ix + 1, iy + 1));
        if (ix + 1 <= Nx && iy - 1 >= Oy)    neighbors.push(this.__grid.cell(ix + 1, iy - 1));
        if (ix - 1 >= Ox && iy + 1 <= Ny)    neighbors.push(this.__grid.cell(ix - 1, iy + 1));
        if (ix - 1 >= Ox && iy - 1 >= Oy)   neighbors.push(this.__grid.cell(ix - 1, iy - 1));

        /// Ближайший сосед
        let nearest = this.__grid.cell(ix, iy);

        // Расстояния от точки до ближайшего соседа
        let ndx = Math.abs(px - nearest.pos.x);
        let ndy = Math.abs(py - nearest.pos.y);

        for (let neighbor of neighbors) {
            /// Расстояния от точки до соседа
            let dx = Math.abs(px - neighbor.pos.x);
            let dy = Math.abs(py - neighbor.pos.y);

            if (dx < ndx || dy < ndy) {
                // если хотя бы по одному измерению расстояние меньше,
                // взять нового ближайшего соседа
                nearest = neighbor;
                ndx = Math.abs(px - nearest.pos.x);
                ndy = Math.abs(py - nearest.pos.y);
            }
        }

        return nearest;
    }

    /**
     * Defines placement constraints of the plate in the specific orientation
     * 
     * This method caches the result for any orientation so it's tolerant to repetitive calls
     * 
     * @param orientation possible orientation of the plate
     * 
     * @returns plate's placement constraints in the specific orientation
     */
    private _getPlacementConstraints(orientation: string) {
        if (!this._constraints) {
            this._constraints = this._calcPlacementConstraints();
        }

        return this._constraints[orientation];
    }

    /**
     * Evaluates placement constraints for all orientations possible for the plate
     * 
     * Placement constraint is the maximum possible coordinates of the pivot plate's cell position in the document.
     * This determines whether the plate can be placed on the board in the specific orientation.
     * 
     * @returns plate placement constraints for each orientation
     */
    private _calcPlacementConstraints(): {[orientation: string]: [number, number, number, number]} {
        /// Размерность доски
        let Dx = this.__grid.dim.x,
            Dy = this.__grid.dim.y;

        /// Размерность плашки
        let Sx = this._params.size.x,
            Sy = this._params.size.y;

        /// Опорная точка плашки
        let orn = this._params.origin;

        /// Количество точек от опорной до края
        let rem = {x: Sx - orn.x, y: Sy - orn.y};

        let constraints: {[orientation: string]: [number, number, number, number]} = {};

        // x goes to Nx, y goes to Ny
        constraints[Plate.Orientations.East] =  [orn.x,          orn.y,         Dx - rem.x,        Dy - rem.y];
        // -y goes to Nx, x goes to Ny
        constraints[Plate.Orientations.North] = [rem.y - 1,      orn.x,         Dx - orn.y - 1,    Dy - rem.x];
        // -x goes to Nx, -y goes to Ny
        constraints[Plate.Orientations.West] =  [rem.x - 1,      rem.y - 1,     Dx - orn.x - 1,    Dy - orn.y - 1];
        // y goes to Nx, -x goes to Ny
        constraints[Plate.Orientations.South] = [orn.y,          rem.x - 1,     Dx - rem.y,        Dy - orn.x - 1];

        return constraints;
    }

    /**
     * Evaluates the cell above which the plate's pivot point is located
     *
     * @param cell the cell above which upper left point of the plate is located
     * 
     * @returns the cell above which the pivot point of the plate is located 
     */
    private _getCellOriginal(cell: Cell): Cell {
        let ix = cell.idx.x,
            iy = cell.idx.y;

        let orn = this._params.origin;

        /// Количество ячеек, занимаемое плашкой
        let sx = this._params.size.x,
            sy = this._params.size.y;

        let dix = 0,
            diy = 0;

        switch (this._state.orientation) {
            case Plate.Orientations.East:   {dix = orn.x;             diy = orn.y;              break;}
            case Plate.Orientations.North:  {dix = sy - orn.y - 1;    diy = orn.x;              break;}
            case Plate.Orientations.West:   {dix = sx - orn.x - 1;    diy = sy - orn.y - 1;     break;}
            case Plate.Orientations.South:  {dix = orn.y;             diy = sx - orn.x - 1;     break;}
        }

        return this.__grid.cell(ix + dix, iy + diy, BorderType.Replicate);
    }

    /**
     * Moves the plate to nearest proper position if it's going out of the grid
     *
     * The method should be called every time the plate is moved or rotated (both automatically and manually)
     *
     * @param throw_error throw an error instead of moving the plate to proper position
     * 
     * @private
     */
    private _preventOverflow(throw_error=false) {
        /// Номер ячейки, занимаемой опорной ячейкой плашки
        let ix = this._state.cell.idx.x,
            iy = this._state.cell.idx.y;

        let [Ox, Oy, Nx, Ny] = this._getPlacementConstraints(this._state.orientation);

        let dx = 0,
            dy = 0;

        if (ix >= Nx) {dx = Nx - ix}
        if (iy >= Ny) {dy = Ny - iy}

        if (ix <= Ox) {dx = Ox - ix}
        if (iy <= Oy) {dy = Oy - iy}

        ix += dx;
        iy += dy;

        if ((dx !== 0 || dy !== 0) && throw_error) {
            throw new RangeError(`Invalid plate position: an overflow occurred at [${ix}, ${iy}] for plate #${this.id}`)
        }

        // анимировать, но только не в случае незавершённой отрисовки
        this.move(this.__grid.cell(ix, iy), false, this._drawn);
    }

    /**
     * Moves the plate's DOM node above others inside the parent container 
     *
     * Used in cases when the plate needs to be displayed on top of the rest 
     * (e.g. while dragging over another plates to keep pointer events active)
     */
    private _rearrange() {
        let node_temp = this._container.node;
        this._container.node.remove();
        this._node_parent.appendChild(node_temp);
    }


    /**
     * Performs the actions required before positioning (moving/drawing) the plate
     *
     * Every time the plate is moving, it's needed to free the cells occupied by it 
     * previously to re-calculate current lines possibly going through the plate.
     */
    private _beforeReposition() {
        // Освободить все ячейки, занимаемые плашкой
        this._reoccupyCells(true);
    }

    /**
     * Performs the actions required after positioning (moving/drawing) the plate
     *
     * Every time the plate is moving, it;s needed to occupy the cells which
     * will be covered by it to re-calculate current lines possibly going through the plate.
     */
    private _afterReposition() {
        // Занять все ячейки, занимаемые плашкой
        this._reoccupyCells();
    }

    /**
     * Toggles the occupation of the cells covered by the plate at the current position.
     * 
     * Has no effect if schematic mode is disabled
     *
     * @param clear whether to free the cells instead of occupation
     */
    private _reoccupyCells(clear: boolean=false) {
        if (!this._params.schematic) return;

        if (!this._params.rels) return;

        let abs = this.state.cell.idx;

        for (let _rel of this._params.rels) {
            // ориентировать относительную ячейку плашки
            let rel = Plate._orientXYObject(_rel, this._state.orientation);
            // определить корректировку для отрисовки тока
            let adj_cur = clear ? null : Plate._orientXYObject(_rel.adj, this._state.orientation);
            // определить корректировку положения всей плашки
            let adj_pos = this._params.adjs ? this._params.adjs[this._state.orientation] : null;

            // учесть, что корректировка положения всей плашки может отсутствовать
            if (adj_pos) {
                adj_pos = {x: adj_pos.x ? adj_pos.x : 0, y: adj_pos.y ? adj_pos.y : 0}
            } else {
                adj_pos = {x: 0, y: 0};
            }

            // сообщить ячейке полученную корректировку
            try {
                let cell = this.__grid.cell(abs.x + rel.x + adj_pos.x, abs.y + rel.y + adj_pos.y);

                let opposite = clear ? null : this._getOppositeCell(cell);

                cell.reoccupy(adj_cur, opposite);
            } catch (e) {
                console.debug("Tried to get a non-existent cell (in purpose to reoccupy)",
                    abs.x + rel.x, abs.y + rel.y
                );
            }
        }
    }

    /**
     * Calculates adjusted coordinates for the plate
     *
     * Does not adjust if schematic mode is enabled
     *
     * @param cell custom cell to use instead of the current position of the plate pivot point 
     *
     * @returns adjusted plate coordinates
     */
    private _getPositionAdjusted(cell: Cell = null): XYObject {
        cell = cell || this._state.cell;

        /// Опорная точка плашки
        let orn = this._params.origin;

        /// Абсолютное положение плашки с учётом того, что ячейка лежит над опорной точкой плашки
        let abs = {
            x: cell.pos.x - orn.x * (cell.size.x + this.__grid.gap.x * 2),
            y: cell.pos.y - orn.y * (cell.size.y + this.__grid.gap.y * 2)
        };

        if (!this._params.schematic) {
            return abs;
        }

        if (!this._params.adjs || !this._params.adjs[this._state.orientation]) {
            return abs;
        }

        let adj = this._params.adjs[this._state.orientation];

        return {x: abs.x + adj.x * cell.size.x, y: abs.y + adj.y * cell.size.y};
    }

    /**
     * Generates SVG path for the plate surface
     * 
     * Surface is a canvas shaped by merging adjacent cell-sized rounded rectangles.
     * 
     * Note that surfaces with holes is not supported, the result may be unsatisfactory.
     * 
     * @param radius corner radius
     * 
     * @returns SVG path commands to build the shape of the surface 
     */
    private _generateSurfacePath(radius=5): (string|number)[][] {
        if (this._params.surface) {
            let path: (string | number)[][] = [];

            // TODO: Verify closed surfaces

            // If the surface exists, convert it from original format to a [x][y]-indexed array 
            let surfcnt = this._convertSurfaceToArray(this._params.surface);

            if (!surfcnt) return;

            let surf_point = this._params.surface[0];
            let cell = this.__grid.cell(surf_point.x, surf_point.y);

            return path.concat(this._buildSurfacePath(cell, surfcnt, radius));
        }
    }

    /**
     * Generates SVG path for the plate surface
     * 
     * The method is recursive.
     * 
     * Path building consists in adding different segments while traversing
     * all the cells of the plate clockwise, starting from the left upper corner. 
     * 
     * There are two types of segments used to build the path:
     *  - corner + gap push/pull
     *  - corner + pure edge
     * 
     * Pure edges are generated in case there are no neighbor cells on the side.
     * Gap pushes are generated when two adjacent cells appears, and the distance between the corners 
     * can be different from the size of the cell in the given {@link Grid}.
     * 
     * When the gap push is generated, the procedure recursively repeats. 
     * After the generation, resulting path is closed by the opposite gap pull.
     * Each gap push should have its opposite gap pull because the surface is closed.
     * Thus, the procedure is ended when the recursion depth becomes zero.
     * 
     * ```
     *          <corner>             <gap push>            <corner>
     *                ********|>>>>>>>>>>>>>>>>>>>>>>>|********
     *               **                                       **
     *              *                                           *
     *              -     /-------\               /-------\     —
     *              v     |       |               |       |     v
     *      <edge>  v     |   X   | <-- gap*2 --> |   X   |     v <edge>
     *              v     |       |               |       |     v
     *              -     \-------/               \-------/     -
     *              *                                           *
     *               **                                       **
     *                ********|<<<<<<<<<<<<<<<<<<<<<<<|******** 
     *         <corner>              <gap pull>            <corner>
     * ```
     * 
     * path = offset + part + closure
     * part = edge / (gap push + part + gap pull)
     * 
     * @see _buildSurfacePathOffset
     * @see _buildSurfacePathGapPush
     * @see _buildSurfacePathGapPull
     * @see _buildSurfacePathEdge
     * @see _buildSurfacePathClosure
     * 
     * @param cell      starting point of the surface
     * @param surfcnt   [x][y]-indexed array of surface points
     * @param radius    corner radius
     * @param dir_idx   direction index
     * @param is_root   whether the method is called from the outside
     * 
     * @returns SVG path commands to build the shape of the surface
     */
    private _buildSurfacePath(cell: Cell, surfcnt: number[][], radius: number, dir_idx=0, is_root=true): (string|number)[][] {
        let path: (string | number)[][] = [];

        // clockwise dir sequence
        let dirs = DirsClockwise;

        if (is_root) {
            path = path.concat(this._buildSurfacePathOffset(cell, radius));
        }

        // main drawing procedure
        while (surfcnt[cell.idx.x][cell.idx.y] < dirs.length) {
            dir_idx = mod(dir_idx, dirs.length);

            let dir = dirs[dir_idx % dirs.length];

            // get neighbor cell for current direction
            let nb = cell.neighbor(dir);

            if (nb && surfcnt[nb.idx.x] && surfcnt[nb.idx.x].hasOwnProperty(nb.idx.y)) {
                surfcnt[cell.idx.x][cell.idx.y] += 1;

                // skip to suppress redundant deepening
                if (surfcnt[nb.idx.x][nb.idx.y] <= 0) {
                    let dir_idx_prev = mod(dir_idx-1, dirs.length);
                    let dir_prev = dirs[dir_idx_prev % dirs.length];

                    let dir_idx_next = mod(dir_idx+1, dirs.length);
                    let dir_next = dirs[dir_idx_next % dirs.length];

                    // push gap
                    path = path.concat(this._buildSurfacePathGapPush(dir, dir_prev, radius));
                    // if neighbor exists for this direction, draw from it
                    path = path.concat(this._buildSurfacePath(nb, surfcnt, radius, dir_idx - 1, false));
                    // pull gap
                    path = path.concat(this._buildSurfacePathGapPull(dir, dir_next, radius));
                }
            } else {
                // otherwise we can draw the edge of this direction
                surfcnt[cell.idx.x][cell.idx.y] += 1;

                path = path.concat(this._buildSurfacePathEdge(cell, dir, radius));
            }

            dir_idx++;
        }

        if (is_root) {
            path.push(this._buildSurfacePathClosure(dirs[0], radius));
        }

        return path;
    }

    /**
     * Generates a "gap push" for the path
     * 
     * Gap push continues the path by the double width/length of the cell's gap.
     * If the path is "pushed" by the gap, then it's needed to pull it on the opposite side.
     * 
     * Gap pushes/pulls take place when two adjacent cells in a plate surface's side is presented.
     * The base path continues from the point of previous edge with the corner and another gap push
     * 
     * @see _buildSurfacePath
     * @see _buildSurfacePathGapPull
     * 
     * @param dir           direction of the path to which the gap is appended
     * @param dir_corner    direction after the corner preceding the gap
     * @param radius        radius of the corner to leave some place to add an arc
     * 
     * @returns SVG path commands to build the corner and subsequent gap push 
     */
    private _buildSurfacePathGapPush(dir: Direction, dir_corner: Direction, radius: number): [(string|number)[], (string|number)[]] {
        let corner = this._buildSurfacePathCorner(dir_corner, radius);

        if (corner === null) {
            radius = 0;
            corner = [];
        }

        switch (dir) {
            case Direction.Up: {
                return [corner, ['v', -(this.__grid.gap.y * 2 - radius*2)]]; // draw up
            }
            case Direction.Right: {
                return [corner, ['h', +(this.__grid.gap.x * 2 - radius*2)]]; // draw right
            }
            case Direction.Down: {
                return [corner, ['v', +(this.__grid.gap.y * 2 - radius*2)]]; // draw down
            }
            case Direction.Left: {
                return [corner, ['h', -(this.__grid.gap.x * 2 - radius*2)]]; // draw left
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }
    }

    /**
     * Generates a "gap pull" for the surface path
     * 
     * Gap pull "reverts" the gap push generated previously at the opposite size of the surface path.
     * 
     * @see _buildSurfacePath
     * @see _buildSurfacePathGapPush
     * 
     * @param dir           direction of the path to which the gap is appended          
     * @param dir_corner    direction after the corner preceding the gap
     * @param radius        radius of the corner to leave some place to add an arc
     *     
     * @returns SVG path commands to build the corner and subsequent build gap pull 
     */
    private _buildSurfacePathGapPull(dir: Direction, dir_corner: Direction, radius: number) {
        let corner = this._buildSurfacePathCorner(dir_corner, radius);

        if (corner === null) {
            radius = 0;
            corner = [];
        }

        switch (dir) {
            case Direction.Up: {
                return [corner, ['v', +(this.__grid.gap.y * 2 - radius*2)]]; // draw down
            }
            case Direction.Right: {
                return [corner, ['h', -(this.__grid.gap.x * 2 - radius*2)]]; // draw left
            }
            case Direction.Down: {
                return [corner, ['v', -(this.__grid.gap.y * 2 - radius*2)]]; // draw up
            }
            case Direction.Left: {
                return [corner, ['h', +(this.__grid.gap.x * 2 - radius*2)]]; // draw right
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }
    }

    /**
     * Generates an edge part for the path
     * 
     * Edge continues the path by the length of the cell.
     * 
     * Edges takes place when there is only single neighbor cell on the side.
     * When the side is wider/longer than 1 cell, {@link _buildSurfacePathGapPush} should be used.
     * 
     * @see _buildSurfacePath
     * 
     * @param cell      cell opposite to which to build
     * @param dir       direction after the corner preceding the edge
     * @param radius    radius of the corner to leave some place to add an arc
     * 
     * @returns SVG path commands te build the corner and subsequent edge
     */
    private _buildSurfacePathEdge(cell: Cell, dir: Direction, radius: number): [(string|number)[], (string|number)[]] {
        let corner = this._buildSurfacePathCorner(dir, radius);

        if (corner === null) {
            radius = 0;
            corner = [];
        }

        switch (dir) {
            case Direction.Up: {
                return [corner, ['h', +(cell.size.x - radius*2)]]; // draw right
            }
            case Direction.Right: {
                return [corner, ['v', +(cell.size.y - radius*2)]]; // draw down
            }
            case Direction.Down: {
                return [corner, ['h', -(cell.size.x - radius*2)]]; // draw left
            }
            case Direction.Left: {
                return [corner, ['v', -(cell.size.y - radius*2)]]; // draw up
            }
            default: {
                throw new RangeError("Invalid direction");
            }
        }
    }

    /**
     * Generates movement command to set initial position of the path
     * 
     * @param cell      initial cell of the path
     * @param radius    corners radius to leave some place to add an arc
     * 
     * @returns SVG path command to move initial point of drawing
     */
    private _buildSurfacePathOffset(cell: Cell, radius: number) {
        let mv_x = (cell.idx.x * (cell.size.x + this.__grid.gap.x * 2)),
            mv_y = (cell.idx.y * (cell.size.y + this.__grid.gap.y * 2));

        return [['M', mv_x + radius, mv_y]];
    }

    /**
     * Generates finishing part of the path
     * 
     * @param dir_curr  current direction of the path
     * @param radius    radius of the corner
     * 
     * @returns SVG path command to build finishing rounded corner
     */
    private _buildSurfacePathClosure(dir_curr: Direction, radius: number) {
        if (this._dir_prev == null) return [];

        let closure = this._buildSurfacePathCorner(dir_curr, radius);

        this._dir_prev = null;

        return closure;
    }

    /**
     * Makes a corner part for the SVG path of the plate surface
     * 
     * Is is supposed that the base path leaves some place 
     * for the arc generated by the path returned from this function.
     * 
     * @param dir_curr  current direction of the path "movement" to track the "rotation" of the path
     * @param radius    corner radius
     * 
     * @returns corner part to append to the base path
     */
    private _buildSurfacePathCorner(dir_curr: Direction, radius: number): (string|number)[] {
        let dir_prev = this._dir_prev;

        if (dir_curr === dir_prev) return null;

        let rx = null,
            ry = null;

        let arc = null;

        if (Cell.IsDirHorizontal(dir_prev) && Cell.IsDirVertical(dir_curr)) {
            rx = (dir_prev === Direction.Up)      ? radius : -radius;
            ry = (dir_curr === Direction.Right)    ? radius : -radius;
        }

        if (Cell.IsDirHorizontal(dir_curr) && Cell.IsDirVertical(dir_prev)) {
            rx = (dir_curr === Direction.Up)      ? radius : -radius;
            ry = (dir_prev === Direction.Right)    ? radius : -radius;
        }

        if (rx !== null && ry !== null) {
            let cw = Cell.IsDirsClockwise(dir_prev, dir_curr) ? 1 : 0;
            arc = ['a', radius, radius, 0, 0, cw, rx, ry];
        }

        let is_first = this._dir_prev == null;

        this._dir_prev = dir_curr;

        return is_first ? [] : arc;
    }

    /**
     * Converts the surface to a sequence of [x][y]-indexed array of zeros
     *
     * @param surface original surface of the plate
     */
    private _convertSurfaceToArray(surface: {x: number, y: number}[]): number[][] {
        let arr: number[][] = [];

        for (let item of surface) {
            if (!arr.hasOwnProperty(item.x)) arr[item.x] = [];

            arr[item.x][item.y] = 0;

            if (arr[item.x].length > this._params.size.y) {
                console.error("Invalid surface for Y size, skipping custom bezel");
                return;
            }

            if (arr.length > this._params.size.x) {
                console.error("Invalid surface for X size, skipping custom bezel");
                return;
            }
        }

        return arr;
    }

    /**
     * @param orientation string descriptor of the orientation
     * 
     * @returns is the orientation horizontal
     */
    public static IsOrientationHorizontal(orientation: string) {
        return (orientation === Plate.Orientations.West || orientation === Plate.Orientations.East);
    }

    /**
     * @param orientation string descriptor of the orientation
     * 
     * @returns is the orientation vertical
     */
    public static IsOrientationVertical(orientation: string) {
        return (orientation === Plate.Orientations.North || orientation === Plate.Orientations.South);
    }

    /**
     * Converts string defining plate orientation to an angle to rotate from the {@link Plate.Orientations.East}
     *
     * @param orientation plate orientation to rotate to
     *
     * @returns rotation angle in degrees
     */
    private static _orientationToAngle(orientation: string) {
        switch (orientation) {
            case Plate.Orientations.East:            {return 0}
            case Plate.Orientations.North:           {return 90}
            case Plate.Orientations.West:            {return 180}
            case Plate.Orientations.South:           {return 270}
            default: {throw new TypeError(`Invalid 'orientation' argument: ${orientation}`)}
        }
    }

    /**
     * Translates {@link XYObject} coordinate increment
     * 
     * If any point will be incremented with the result of this method, 
     * it will be "rotated" relative to the origin to the specified orientation.
     * 
     * @param xyobj 
     * @param orientation 
     * @returns 
     */
    protected static _orientXYObject(xyobj: {x: number, y: number}, orientation: string): {x: number, y: number} {
        let xynew: {x: number, y: number} = {x: undefined, y: undefined};

        switch (orientation) {
            case Plate.Orientations.East:   {xynew.x = xyobj.x;    xynew.y = xyobj.y;     break;}
            case Plate.Orientations.South:  {xynew.x = xyobj.y;    xynew.y = -xyobj.x;    break;}
            case Plate.Orientations.West:   {xynew.x = -xyobj.x;   xynew.y = -xyobj.y;    break;}
            case Plate.Orientations.North:  {xynew.x = -xyobj.y;   xynew.y = xyobj.x;     break;}
            default: {throw new TypeError(`Invalid 'orientation' argument: ${orientation}`)}
        }

        return xynew;
    }
}