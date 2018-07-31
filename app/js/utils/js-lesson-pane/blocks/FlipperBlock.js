import Block from "../core/Block";

import thm from "../styles/flipper/flipper.css";

const SIDES = {
    FRONT: 'front',
    TOP: 'top',
    BOTTOM: 'bottom'
};

const CLASSES = {
    SHOW: "show",
    PARENT: "parent"
};

export default class FlipperBlock extends Block {
    static get ClassDOM() {return "flipper"}

    constructor() {
        super();

        this._sides = {
            front: undefined,
            top: undefined,
            bottom: undefined,
        };

        this._state.side = undefined;
    }

    include(dom_node, front_node, top_node, bottom_node) {
        super.include(dom_node);

        dom_node.parentNode.classList.add(FlipperBlock.ClassDOM + "-" + CLASSES.PARENT);

        front_node.classList.add(FlipperBlock.ClassDOM + "__" + SIDES.FRONT);
        top_node.classList.add(FlipperBlock.ClassDOM + "__" + SIDES.TOP);
        bottom_node.classList.add(FlipperBlock.ClassDOM + "__" + SIDES.BOTTOM);

        this._sides.front = front_node;
        this._sides.top = top_node;
        this._sides.bottom = bottom_node;

        this.showSide(SIDES.FRONT);
    }

    showSide(side_name) {
        if (Object.values(SIDES).indexOf(side_name) === -1) {
            throw new RangeError(`Side name '${side_name}' is not available`);
        }

        this._container.classList.remove(`${FlipperBlock.ClassDOM}_${CLASSES.SHOW}_${this._state.side}`);
        this._container.classList.add(`${FlipperBlock.ClassDOM}_${CLASSES.SHOW}_${side_name}`);

        this._state.side = side_name;
    }
}
