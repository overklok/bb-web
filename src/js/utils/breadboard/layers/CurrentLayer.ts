import SVG from "svg.js";

import Grid, { AuxPoint, AuxPointCategory, AuxPointType } from "../core/Grid";
import Cell from "../core/Cell";
import Layer from "../core/Layer";
import Current, { CurrentPath, Thread } from "../core/Current";
import * as Threads from "../core/extras/threads";
import BackgroundLayer from "./BackgroundLayer";
import CurrentPopup from "../popups/CurrentPopup";
import { XYPoint } from "../core/extras/types";

/**
 * Displays and manages {@link Current} objects.
 * Handles current data formats, generates paths for the {@link Current}s.
 *
 * @see Current
 *
 * @category Breadboard
 * @subcategory Layers
 */
export default class CurrentLayer extends Layer {
    /** CSS class of the layer */
    static get Class() {
        return "bb-layer-current";
    }

    /** The minimum weight of a {@link Current} that is required to render it */
    static get MeaningfulnessThreshold() {
        return 1e-8;
    }

    /** layer's main SVG container */
    protected _container: SVG.Container;

    protected _popups: { [key: number]: CurrentPopup };

    /** list of {@link Current} instances being displayed */
    private _currents: { [key: number]: Current };
    /** collection of {@link Current} data objects */
    private _threads: {};

    /** simple graphic mode flag */
    private _spare: any;
    /** SVG group for currents */
    private _currentgroup: any;
    /** whether short circuit is detected  */
    private _shorted: boolean;

    /** local event handlers */
    private _callbacks: {
        shortcircuit: () => void; // short circuit detected
        shortcircuitstart: () => void; // short circuit started
        shortcircuitend: () => void; // short circuit ended
    };

    /**
     * @inheritdoc
     */
    constructor(
        container: SVG.Container,
        grid: Grid,
        schematic: boolean = false,
        detailed: boolean = false,
        verbose: boolean = false
    ) {
        super(container, grid, schematic, detailed, verbose);

        this._container.addClass(CurrentLayer.Class);

        this._currents = {};
        this._threads = {};

        this._spare = undefined;

        this._currentgroup = undefined;

        this._shorted = false;

        this._callbacks = {
            shortcircuit: () => {},
            shortcircuitstart: () => {},
            shortcircuitend: () => {}
        };
    }

    /**
     * @inheritdoc
     */
    public compose() {
        this._initGroups();
    }

    /**
     * @inheritdoc
     */
    public recompose(
        schematic: boolean,
        detailed: boolean,
        verbose: boolean = true
    ) {
        super.recompose(schematic, detailed, verbose);

        let threads = Object.assign([], this._threads);

        this.removeAllCurrents();

        this._initGroups();

        this.setCurrents(threads, this._spare, verbose);
    }

    /**
     * Attaches callback function as the 'short circuit detected' event handler
     *
     * The event triggers when one of existing currents is 'burning' (see {@link Current.is_burning}).
     * It triggers each time the currents are updated, independently of which current is burning at the moment
     * and whether it has burned prevously or not.
     *
     * @param cb callback to attach
     */
    public onShortCircuit(cb?: () => void) {
        this._callbacks.shortcircuit = cb || (() => {});
    }

    /**
     * Attaches callback function as the 'short circuit started' event handler
     *
     * The event triggers after 'shortcircuit' only
     * if it wasn't triggered prevously without a subsequent 'shortcircuitend' event.
     *
     * @param cb callback to attach
     */
    public onShortCircuitStart(cb?: () => void) {
        if (!cb) {
            this._callbacks.shortcircuitstart = () => {};
        }

        this._callbacks.shortcircuitstart = cb;
    }

    /**
     * Attaches callback function as the 'short circuit ended' event handler
     *
     * The event triggers when there is no short-circuit currents were detected
     * after the moment when 'shortcircuitstart' event has been triggered.
     *
     * @param cb callback to attach
     */
    public onShortCircuitEnd(cb?: () => void) {
        if (!cb) {
            this._callbacks.shortcircuitend = () => {};
        }

        this._callbacks.shortcircuitend = cb;
    }

    /**
     * Returns all {@link Current} instances presented in the layer at the moment.
     *
     * @returns an object in which the keys are the IDs of the {@link Current} instance presented in the value
     */
    public getAllCurrents(): { [key: number]: Current } {
        return this._currents;
    }

    /**
     * Removes the selected current
     *
     * @param id current ID
     */
    public removeCurrent(id: number) {
        if (typeof id === "undefined") {
            throw new TypeError("Argument 'id' must be defined");
        }

        if (!(id in this._currents)) {
            throw new TypeError(`Current ${id} does not exist`);
        }

        let current = this._currents[id];
        let popup = this._popups[id];

        current.erase();
        this._requestPopupClear(popup);

        delete this._currents[current.id];
        delete this._popups[current.id];
    }

    /**
     * Removes all of the currents presented in the layer
     */
    public removeAllCurrents() {
        for (let current_id in this._currents) {
            this.removeCurrent(Number(current_id));
        }

        this._threads = {};
    }

    /**
     * Activates all of the currents presented in the layer
     *
     * By default, the current activates automatilcally when added.
     *
     * @see Current.activate
     */
    public activateAllCurrents() {
        for (let current of Object.values(this._currents)) {
            current.activate();
        }
    }

    /**
     * Deactivates all of the currents presented in the layer
     *
     * @see Current.deactivate
     */
    public deactivateAllCurrents() {
        for (let current of Object.values(this._currents)) {
            current.deactivate();
        }
    }

    /**
     * Sets the currents to be presented in the layer
     *
     * Creation of the new and removal of existing currents is performed automatically.
     * If the same current is already presented, its weight will be updated only.
     *
     * @param threads     list of objects containing data about the currents needed to present
     * @param spare       use simple graphics to keep performance comfortable
     * @param show_source draw additional currents to show the flow from voltage source
     */
    public setCurrents(
        threads: Thread[],
        spare: boolean,
        show_source: boolean = true
    ) {
        const threads_filtered = [];

        for (const thread of threads) {
            if (this.__grid.virtualPoint(thread.from.x, thread.from.y))
                continue;
            if (this.__grid.virtualPoint(thread.to.x, thread.to.y)) continue;

            threads_filtered.push(thread);
        }

        threads = Threads.overlayThreads(threads_filtered);

        this._threads = threads;
        this._spare = spare;

        /// remove possible marks from local currents
        for (let current_id in this._currents) {
            this._currents[current_id].___touched = undefined;
        }

        /// perform the main loop
        for (let current_id in this._currents) {
            /// extract the current
            let current = this._currents[current_id];

            /// keep here detected identical thread
            let same: Thread = undefined;

            /// loop over new threads
            for (let [i, thread] of threads.entries()) {
                /// if local current is found with the same thread
                if (current.hasSameThread(thread)) {
                    /// save that thread
                    same = thread;
                    /// set the flags for both current and the thread
                    thread.___touched = true;
                    current.___touched = true;

                    break;
                }
            }

            if (same) {
                if (same.weight < CurrentLayer.MeaningfulnessThreshold) {
                    // remove the current if it's not weighty enough
                    this.removeCurrent(Number(current_id));
                } else {
                    // update the weight of the current
                    this._setCurrentWeight(current, same.weight);
                }
            }
        }

        /// remove non-marked local currents
        for (let current_id in this._currents) {
            if (!this._currents[current_id].___touched) {
                this.removeCurrent(Number(current_id));
            }
        }

        /// create currents for non-marked threads
        for (let [i, thread] of threads.entries()) {
            if (!thread.___touched) {
                if (thread.weight < CurrentLayer.MeaningfulnessThreshold) {
                    // remove current's thread if it's not weighty enough
                    delete threads[i];
                } else {
                    // create new current
                    let cur = this._addCurrent(thread, spare, show_source);

                    if (cur) {
                        cur.___touched = true;
                    }
                }
            }
        }

        this._findShortCircuits();
    }

    /**
     * Initializes internal SVG groups
     */
    private _initGroups() {
        this._clearGroups();

        this._currentgroup = this._container.group();
    }

    /**
     * Removes SVG groups created previously with {@link _initGroups}
     */
    private _clearGroups() {
        if (this._currentgroup) this._currentgroup.remove();
    }

    /**
     * Detects any short circuited {@link Current}s, i.e. {@link Current}s with the
     * {@link Current.is_burning} flag set
     */
    private _findShortCircuits() {
        for (const id in this._currents) {
            if (!this._currents.hasOwnProperty(id)) continue;

            if (this._currents[id].is_burning) {
                this._callbacks.shortcircuit();

                if (!this._shorted) {
                    this._callbacks.shortcircuitstart();
                    this._shorted = true;
                }

                return;
            }
        }

        if (this._shorted === true) {
            this._callbacks.shortcircuitend();
        }

        this._shorted = false;
    }

    /**
     * Adds a current to the layer
     *
     * @see setCurrents
     *
     * @param thread      current's circuit
     * @param spare       use simple graphics to keep performance comfortable
     * @param show_source draw additional currents to show the flow from voltage source
     *
     * @returns the {@link Current} instance added to the layer
     */
    private _addCurrent(
        thread: Thread,
        spare: boolean,
        show_source: boolean = true
    ) {
        if (!thread) {
        }

        let line_path = this._buildCurrentLinePath(thread);
        if (line_path.length === 0) return null;

        const current = new Current(
                this._currentgroup,
                thread,
                this.__schematic
            ),
            popup = new CurrentPopup(String(current.id));

        this._currents[current.id] = current;
        this._popups[current.id] = popup;

        current.draw(line_path);
        current.activate();

        this._requestPopupDraw(popup, {
            weight: current.thread.weight,
            weight_norm: current.weight
        });

        this._attachEventsHoverable(current);

        return current;
    }

    private _setCurrentWeight(current: Current, weight: number) {
        current.setWeight(weight);
        this._popups[current.id].updateContent({
            weight: current.thread.weight,
            weight_norm: current.weight
        });
    }

    private _attachEventsHoverable(current: Current) {
        if (!current) {
            throw new TypeError("A `current` argument must be defined");
        }

        current.makeHoverable(true);

        current.onMouseEnter(() => {
            this._requestPopupShow(this._popups[current.id]);
        });

        current.onMouseLeave(() => {
            this._requestPopupHide(this._popups[current.id]);
        });
    }

    /**
     * Builds the path of a current flow
     *
     * @param points object containing source and destination points of the current flow
     *
     * @returns a sequence of SVG path commands
     */
    private _buildCurrentLinePath(points: {
        from: XYPoint;
        to: XYPoint;
    }): CurrentPath {
        if (
            this.__grid.virtualPoint(points.from.x, points.from.y) ||
            this.__grid.virtualPoint(points.to.x, points.to.y)
        ) {
            return [];
        }

        const aux_point_from = this.__grid.auxPoint(
                points.from.x,
                points.from.y
            ),
            aux_point_to = this.__grid.auxPoint(points.to.x, points.to.y);

        const aux_point = aux_point_to || aux_point_from,
            to_aux = !!aux_point_to;

        if (aux_point && !Array.isArray(aux_point)) {
            const c_arb = to_aux
                ? this.__grid.getCell(points.from.x, points.from.y)
                : this.__grid.getCell(points.to.x, points.to.y);

            switch (aux_point.cat) {
                case AuxPointCategory.SourceV5:
                    return this._getLinePathSource(c_arb, aux_point, to_aux);
                case AuxPointCategory.SourceV8:
                    return this._getLinePathSource(c_arb, aux_point, to_aux);
                case AuxPointCategory.Usb1:
                    return this._getLinePathUsb(c_arb, aux_point, to_aux);
                case AuxPointCategory.Usb3:
                    return this._getLinePathUsb(c_arb, aux_point, to_aux);
            }
        }

        const c_from = this.__grid.getCell(points.from.x, points.from.y),
            c_to = this.__grid.getCell(points.to.x, points.to.y);

        return this._getLinePathArbitrary(c_from, c_to);
    }

    /**
     * Generates the path for current placed in arbitrary cells
     *
     * @param c_from    starting point of the current flow
     * @param c_to      end point of the current flow
     *
     * @returns a sequence of SVG path commands
     */
    private _getLinePathArbitrary(c_from: Cell, c_to: Cell): CurrentPath {
        let needs_bias = false;

        if (this.__schematic && this.__detailed) {
            needs_bias = true;
        }

        let bias_x =
            needs_bias && !Cell.IsLineHorizontal(c_from, c_to)
                ? BackgroundLayer.DomainSchematicBias
                : 0;
        let bias_y =
            needs_bias && Cell.IsLineHorizontal(c_from, c_to)
                ? BackgroundLayer.DomainSchematicBias
                : 0;

        if (
            Cell.IsLineAt(c_from, c_to, null, this.__grid.curr_straight_top_y)
        ) {
            // cells at the "+" line

            // FIXME: Temporary solution! Do not use in final production!
            return [
                ["M", c_from.center_adj.x, c_from.center_adj.y - bias_y],
                ["L", c_to.center_adj.x, c_to.center_adj.y - bias_y],
                ["L", c_to.center_adj.x, c_to.center_adj.y]
            ];
        }

        if (
            Cell.IsLineAt(
                c_from,
                c_to,
                null,
                this.__grid.curr_straight_bottom_y
            )
        ) {
            // cells at the "-" line

            // FIXME: Temporary solution! Do not use in final production!
            return [
                ["M", c_from.center_adj.x, c_from.center_adj.y],
                ["L", c_from.center_adj.x, c_from.center_adj.y + bias_y],
                ["L", c_to.center_adj.x, c_to.center_adj.y + bias_y]
            ];
        }

        return [
            ["M", c_from.center_adj.x, c_from.center_adj.y],
            ["L", c_from.center_adj.x + bias_x, c_from.center_adj.y + bias_y],
            ["L", c_to.center_adj.x + bias_x, c_to.center_adj.y + bias_y],
            ["L", c_to.center_adj.x, c_to.center_adj.y]
        ];
    }

    /**
     * Generates the path for current linked with the voltage source
     *
     * Such currents starts (or finishes) in the arbitrary cell,
     * and respectively finishes (or starts) in one of the voltage source cells.
     *
     * It is important to explicilty specify the direction of the current flow
     * because there is only one {@link Cell} in the method parameters.
     *
     * @param c_arb     single arbitrary current cell (starting of finishing)
     * @param aux_point single auxiliary point (votage source's Vcc or Gnd)
     * @param to_source whether the current is directed to the source
     *
     * @returns a sequence of SVG path commands
     */
    private _getLinePathSource(
        c_arb: Cell,
        aux_point: AuxPoint,
        to_source: boolean = false
    ): CurrentPath {
        let needs_bias = this.__schematic && this.__detailed,
            bias_y = Number(needs_bias) * BackgroundLayer.DomainSchematicBias;

        if (to_source) {
            if (aux_point.name === AuxPointType.Vcc) {
                bias_y = -bias_y;
            }

            return [
                ["M", c_arb.center_adj.x, c_arb.center_adj.y],
                ["L", c_arb.center_adj.x, c_arb.center_adj.y + bias_y],

                ["L", aux_point.pos.x, aux_point.cell.center_adj.y + bias_y],
                ["L", aux_point.pos.x, aux_point.pos.y]
            ];
        } else {
            if (aux_point.name === AuxPointType.Gnd) {
                bias_y = -bias_y;
            }

            return [
                ["M", aux_point.pos.x, aux_point.pos.y],
                ["L", aux_point.pos.x, aux_point.cell.center_adj.y - bias_y],

                ["L", c_arb.center_adj.x, c_arb.center_adj.y - bias_y],
                ["L", c_arb.center_adj.x, c_arb.center_adj.y]
            ];
        }
    }

    /**
     * Generates the path for current linked with the USB port
     *
     * Such currents starts (or finishes) in the arbitrary cell,
     * and respectively finishes (or starts) in one of the voltage source cells.
     *
     * It is important to explicilty specify the direction of the current flow
     * because there is only one {@link Cell} in the method parameters.
     *
     * @param c_arb     single arbitrary current cell (starting of finishing)
     * @param aux_point single auxiliary point (one of USB pins)
     * @param to_source
     *
     * @returns SVG path coordinates for current
     */
    private _getLinePathUsb(
        c_arb: Cell,
        aux_point: AuxPoint,
        to_source: boolean = false
    ): CurrentPath {
        if (to_source) {
            return [
                ["M", c_arb.center_adj.x, c_arb.center_adj.y],
                ["L", aux_point.pos.x - aux_point.bias, c_arb.center_adj.y],
                ["L", aux_point.pos.x - aux_point.bias, aux_point.pos.y],
                ["L", aux_point.pos.x, aux_point.pos.y]
            ];
        } else {
            return [
                ["M", aux_point.pos.x, aux_point.pos.y],
                ["L", aux_point.pos.x - aux_point.bias, aux_point.pos.y],
                ["L", aux_point.pos.x - aux_point.bias, c_arb.center_adj.y],
                ["L", c_arb.center_adj.x, c_arb.center_adj.y]
            ];
        }
    }

    /**
     * Continues the path with SVG coordinates to the next pair of cells
     *
     * @param path        the path to continue
     * @param cell_from   source point
     * @param cell_to     destination point
     *
     * @deprecated
     */
    private static _appendLinePath(
        path: CurrentPath,
        cell_from: Cell,
        cell_to: Cell
    ) {
        path.push(["M", cell_from.center.x, cell_from.center.y]);
        path.push(["L", cell_from.center.x, cell_from.center.y]);
        path.push(["L", cell_to.center.x, cell_to.center.y]);
    }
}
