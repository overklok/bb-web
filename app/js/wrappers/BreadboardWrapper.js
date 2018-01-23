import Wrapper from "../core/Wrapper";

import Breadboard from "../~utils/breadboard/core/Breadboard";

class BreadboardWrapper extends Wrapper {
    constructor() {
        super();

        this._bb = new Breadboard();
    }

    inject(dom_node) {
        this._bb.start(dom_node);

        this._bb.brush.node.style.width = '100%';
        this._bb.brush.node.style.height = '100%';
    }

    takeout() {
        this._bb.clear();
    }

}

export default BreadboardWrapper;