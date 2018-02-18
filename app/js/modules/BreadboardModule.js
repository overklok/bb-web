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
        if (this._state.display) {return true}

        if (dom_node !== undefined) {
            this._board.inject(dom_node);

            this._state.display = true;
        }
    }

    eject(strict, dom_node) {
        // if (strict && !dom_node) {return false}

        if (!this._state.display) {return true}

        this._board.eject();

        this._state.display = false;
    }

    _subscribeToWrapperEvents() {
        // No events
    }
}

export default BreadboardModule;