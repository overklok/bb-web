import Block from "../Block";
import BarItemBlock from "./BarItemBlock";

class BarBlock extends Block {
    constructor() {
        super();

        this._items = [];
    }

    include(dom_node) {
        super.include(dom_node);
    }

    /**
     *
     * @param {BarItemBlock} item
     */
    addItem(item) {
        if (!(item instanceof BarItemBlock)) {throw new TypeError("Item must is not an instance of BarItemBlock")}

        super.addItem(item);
    }
}

export default BarBlock;