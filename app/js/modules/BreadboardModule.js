import Module from "../core/Module";

import BreadboardWrapper from '../wrappers/BreadboardWrapper';

class BreadboardModule extends Module {
    static get eventspace_name() {return "bb"}
    static get event_types() {return {}}

    constructor(settings) {
        super();

        this._board = new BreadboardWrapper();
    }

    _subscribeToWrapperEvents() {
        // No events
    }
}

export default BreadboardModule;