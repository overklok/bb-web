import Module from "../core/Module";

import Breadboard from "../utils/breadboard/Breadboard";
import {LAYOUTS} from "../utils/breadboard/extras/layouts";

/**
 * Модуль для работы с макетной платой
 */
export default class BreadboardModule extends Module {
    static get eventspace_name() {return "bb"}
    static get event_types() {return [
        "change", "drag-start", "shortcircuit-start", "shortcircuit-end", "layout-change"
    ]}

    static defaults() {
        return {
            layoutAdvanced: false,
            modeAdmin:      false,
            schematic:      false,
            detailed:       false,
            verbose:        false,
            spare:          false,
        }
    }

    constructor(options) {
        super(options);

        this._state = {
            display: false,
            spare: this._options.spare,
            schematic: this._options.schematic,
            detailed: this._options.detailed,
            verbose: this._options.verbose,
        };

        this._board = new Breadboard();
        this._board.registerLayouts(LAYOUTS);

        this._subscribeToWrapperEvents();
    }

    setAdminMode(isAdmin) {
        this._options.modeAdmin = isAdmin;
        this._board.setReadOnly(!isAdmin);
    }

    inject(dom_node) {
        return new Promise(resolve => {
            if (this._state.display) {
                resolve(true);
                return;
            }

            if (dom_node !== undefined) {
                // this._board.inject(dom_node, false);
                this._board.inject(dom_node, {
                    readOnly: !this._options.modeAdmin,
                    layout: this._options.layoutAdvanced ? 'v8x' : 'default'
                });

                this._state.display = true;

                if (this._state.spare != null) {
                    this.switchSpareFilters(this._state.spare);
                }

                if (this._state.schematic != null) {
                    this.switchSchematic(this._state.schematic, this._state.detailed);
                } else if (this._state.detailed === true) {
                    this._state.schematic = true;
                    this.switchSchematic(this._state.schematic, this._state.detailed);
                }
            }

            resolve();
        });
    }

    eject() {
        if (!this._state.display) {return true}

        this._board.dispose();

        this._state.display = false;
        // this._state.spare = false;
    }

    highlightErrorPlates(plate_ids) {
        if (!this._state.display) {return true}

        this._board.highlightPlates(plate_ids);
    }

    updatePlates(plates) {
        if (!this._state.display) {return true}

        this._board.clearRegions();

        return this._board.setPlates(plates);
    }

    updatePlateState(plate_id, state) {
        if (!this._state.display) {return true}

        this._board.setPlateState(plate_id, state);
    }

    updateCurrents(data) {
        if (!data) throw new TypeError ("Currents data is not defined");

        if (!this._state.display) {return true}

        if (data.threads) {
            this._board.setCurrents(data.threads);
        }

        if (!('elements' in data)) {return true}

        for (let element of data.elements) {
            this._board.setPlateState(element.id, {
                currents: element.currents,
                voltages: element.voltages,
                // hidden: <smth>
                // bytes_to_board: <smth>
            });

            if (element.highlight != null) {
                this._board.setPlateState(element.id, {
                    highlighted: element.highlight
                });
            }
        }

        return true;
    }

    clearCurrents() {
        if (!this._state.display) {return true}

        this._board.removeAllCurrents();

        for (let plate of this._board.getPlates()) {
            this._board.setPlateState(plate.id, {
                highlighted: false,
            });
        }
    }

    highlightRegion(region, clear) {
        if (!this._state.display) return;
        if (!region) return;

        this._board.highlightRegion(region.from, region.to, clear);
    }

    clearRegions() {
        if (!this._state.display) {return true}

        this._board.clearRegions();
    }

    setPinsValues(values) {
        this._board.setPinsValues(values);
    }

    getPlates() {
        if (!this._state.display) {return false}

        return this._board.getPlates();
    }

    switchSpareFilters(on) {
        this._state.spare = on;

        if (!this._state.display) {
            return false
        }

        this._board.switchSpareFilters(on);
    }

    setLayout(alias) {
        this._board.setLayout(alias);
    }

    getLayout() {
        return this._board.getLayout();
    }

    getBoardInfo() {
        return this._board.getBoardInfo();
    }

    switchSchematic(on, detailed=false) {
        if (!this._state.display) {
            this._state.schematic = on;
            this._state.detailed = on ? detailed : false;
            return false
        }

        this._board.switchSchematic(on, this._state.detailed, this._state.verbose);
    }

    switchVerbose(on) {
        if (!this._state.display) {
            this._state.verbose = on;
            return false
        }

        this._board.switchVerbose(this._state.verbose);
    }

    _subscribeToWrapperEvents() {
        this._board.onChange((data) => {
            this.clearRegions();
            this.emitEvent("change", data);
        });

        this._board.onDragStart((data) => {
            this.emitEvent("drag-start", data);
        });

        this._board.onShortCircuitStart(() => {
            this.emitEvent("shortcircuit-start", null);
        });

        this._board.onShortCircuitEnd(() => {
            this.emitEvent("shortcircuit-end", null);
        });

        this._board.onLayoutChange(() => {
            this.emitEvent("layout-change", null);
        })
    }
}
