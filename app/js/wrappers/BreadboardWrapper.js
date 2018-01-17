import Wrapper from "../core/Wrapper";

import Breadboard from "../~utils/breadboard/core/Breadboard";

class BreadboardWrapper extends Wrapper {
    constructor() {
        super();

        this._bb = new Breadboard();

        this._bb.start();
    }
}

export default BreadboardWrapper;