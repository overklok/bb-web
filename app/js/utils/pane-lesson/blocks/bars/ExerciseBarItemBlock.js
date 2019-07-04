import BarItemBlock from "../../core/blocks/BarItemBlock";

// TODO: Допилить

export default class ExerciseBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "exercise-bar__item"}

    constructor() {
        super();

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' was triggered")}
        }
    }

    include(dom_node) {
        super.include(dom_node);

        let container = document.createElement("div");
        this._container.appendChild(container);

        this._attachCallbacks();
    }

    dispose() {
        super.dispose();
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _attachCallbacks() {
        this._link.onClick(() => {this._callbacks.onclick()});
    }
}