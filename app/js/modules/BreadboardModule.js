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
            modeAdmin: false,
        }
    }

    constructor(options) {
        super(options);

        this._state = {
            display: false,
        };

        this._board = new BreadboardWrapper();

        this._subscribeToWrapperEvents();
    }

    inject(dom_node) {
        return new Promise(resolve => {
            if (this._state.display) {
                resolve(true);
                return;
            }

            if (dom_node !== undefined) {
                this._board.inject(dom_node, false);
                // this._board.inject(dom_node, !this._options.modeAdmin);

                this._state.display = true;
            }

            resolve();
        });
    }

    eject() {
        if (!this._state.display) {return true}

        this._board.eject();

        this._state.display = false;
    }

    highlightErrorPlates(plate_ids) {
        if (!this._state.display) {return true}

        this._board.highlightErrorPlates(plate_ids);
    }

    updatePlates(plates) {
        this._board.setPlates(plates);
    }

    updatePlateState(plate_id, state) {
        this._board.setPlateState(plate_id, state);
    }

    updateCurrents(data) {
        if (!data) {return false}

        if (data.threads) {
            this._board.setCurrent(data.threads);
        }

        if (!('elements' in data)) {return true}

        // это будет приходить с сервера
        for (let element of data.elements) {
            this._board.setPlateState(element.id, {
                highlighted: element.highlight || false,
                currents: element.currents,
                voltages: element.voltages,
                // hidden: <smth>
                // bytes_to_board: <smth>
            })
        }

        return true;
    }

    clearCurrents() {
        this._board.removeCurrents();

        for (let plate of this._board.getPlates()) {
            this._board.setPlateState(plate.id, {
                highlighted: false,
            });
        }
    }

    highlightRegion(region, clear) {
        this._board.highlightRegion(region, clear);
    }

    clearRegions() {
        this._board.clearRegions();
    }

    getData() {
        if (!this._state.display) {return false}

        let plates = this._board.getPlates();

        return plates;
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