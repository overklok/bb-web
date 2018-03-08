import Module from "../core/Module";

import BreadboardWrapper from '../wrappers/BreadboardWrapper';

class BreadboardModule extends Module {
    static get eventspace_name() {return "bb"}
    static get event_types() {return []}

    constructor(options) {
        super(options);

        this._state = {
            display: false,
        };

        this._board = new BreadboardWrapper();
    }

    inject(dom_node) {
        return new Promise(resolve => {
            if (this._state.display) {
                resolve(true);
                return;
            }

            if (dom_node !== undefined) {
                this._board.inject(dom_node);

                this._state.display = true;
            }

            resolve();
        });
    }

    eject() {
        // if (strict && !dom_node) {return false}
        if (!this._state.display) {return true}

        this._board.eject();

        this._state.display = false;
    }

    updatePlates(plates) {
        this._board.setPlates(plates);
    }

    updateCurrents(data) {
        let points = [];

        for (let thread of data.threads) {
            points.push({from: thread.begin, to: thread.end})
        }

        this._board.setCurrent(points);
    }

    getData() {
        return {};
    }

    _subscribeToWrapperEvents() {
        // No events
    }
}

export default BreadboardModule;