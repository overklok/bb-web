import Module from "../core/Module";

import BreadboardWrapper from '../wrappers/BreadboardWrapper';

/**
 * Модуль для работы с макетной платой
 */
export default class BreadboardModule extends Module {
    static get eventspace_name() {return "bb"}
    static get event_types() {return ["change", "drag-start"]}

    static defaults() {
        return {
            modeAdmin:  false,
            schematic:  false,
            detailed:   false, // works only with 'schematic'
            spare:      false,
        }
    }

    constructor(options) {
        super(options);

        this._state = {
            display: false,
            spare: this._options.spare,
            schematic: this._options.schematic,
            detailed: this._options.detailed,
        };

        this._board = new BreadboardWrapper();

        this._subscribeToWrapperEvents();
    }

    setAdminMode(isAdmin) {
        this._options.modeAdmin = isAdmin;
        this._board.setReadOnly(!isAdmin);
        //let plates = this.getPlates();
        // пересоздание
        //this.setPlates(plates);
        // this._board.setReadOnly(!isAdmin);
    }

    inject(dom_node) {
        return new Promise(resolve => {
            if (this._state.display) {
                resolve(true);
                return;
            }

            if (dom_node !== undefined) {
                // this._board.inject(dom_node, false);
                this._board.inject(dom_node, !this._options.modeAdmin);

                this._state.display = true;

                if (this._state.spare != null) {
                    this.switchSpareFilters(this._state.spare);
                }

                if (this._state.schematic != null) {
                    this.switchSchematic(this._state.schematic, this._state.detailed);
                }
            }

            resolve();
        });
    }

    eject() {
        if (!this._state.display) {return true}

        this._board.eject();

        this._state.display = false;
        this._state.spare = false;
    }

    highlightErrorPlates(plate_ids) {
        if (!this._state.display) {return true}

        this._board.highlightErrorPlates(plate_ids);
    }

    updatePlates(plates) {
        if (!this._state.display) {return true}

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

        // это будет приходить с сервера
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

        this._board.removeCurrents();

        for (let plate of this._board.getPlates()) {
            this._board.setPlateState(plate.id, {
                highlighted: false,
            });
        }
    }

    highlightRegion(region, clear) {
        if (!this._state.display) {return true}

        this._board.highlightRegion(region, clear);
    }

    clearRegions() {
        if (!this._state.display) {return true}

        this._board.clearRegions();
    }

    getPlates() {
        if (!this._state.display) {return false}

        return this._board.getPlates();
    }

    switchSpareFilters(on) {
        if (!this._state.display) {
            this._state.spare = on;
            return false
        }

        this._board.switchSpareFilters(on);
    }

    switchSchematic(on, detailed=false) {
        if (!this._state.display) {
            this._state.schematic = on;
            this._state.detailed = on ? detailed : false;
            return false
        }

        this._board.switchSchematic(on, this._state.detailed);
    }

    _subscribeToWrapperEvents() {
        this._board.onChange((data) => {
            this.clearRegions();
            this.emitEvent("change", data);
        });

        this._board.onDragStart((data) => {
            this.emitEvent("drag-start", data);
        });
    }
}
