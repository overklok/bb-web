import Module from "../core/Module";

import BreadboardWrapper from '../wrappers/BreadboardWrapper';

class BreadboardModule extends Module {
    static get eventspace_name() {return "bb"}
    static get event_types() {return ["change"]}

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
                this._board.inject(dom_node, !this._options.modeAdmin);

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

    updatePlates(plates) {
        this._board.setPlates(plates);
    }

    updatePlateState(plate_id, state) {
        this._board.setPlateState(plate_id, state);
    }

    updateCurrents(data) {
        let points = [];

        for (let thread of data.threads) {
            points.push({from: thread.begin, to: thread.end})
        }

        this._board.setCurrent(points);
    }

    getData() {
        if (!this._state.display) {return false}

        return this._board.getPlates();
    }

    _subscribeToWrapperEvents() {
        this._board.onChange((data) => {
            this.emitEvent("change", data);
        })
    }
}

export default BreadboardModule;