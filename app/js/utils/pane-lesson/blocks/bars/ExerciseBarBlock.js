import BarBlock from "../../core/blocks/BarBlock";

// TODO: Допилить

import ExerciseBarItemBlock from "./ExerciseBarItemBlock";

export default class ExerciseBarBlock extends BarBlock {
    static get ClassDOM() {return "exercise-bar"}

    constructor() {
        super();

        this._callbacks = {
            onclick: (idx) => {console.warn("Unhandled event 'click' was triggered with data:", idx)}
        };
    }

    include(dom_node) {
        super.include(dom_node);
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _attachCallbacks() {
        let idx = 0;

        for (let item of this._items) {
            let _idx = idx;

            item.onClick(() => {
                this._callbacks.onclick(_idx);
            });

            idx++;
        }
    }
}