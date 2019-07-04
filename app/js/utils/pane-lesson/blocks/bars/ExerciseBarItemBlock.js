import BarItemBlock from "../../core/blocks/BarItemBlock";
import "../../styles/bars/exercise-bar/__item/exercise-bar__item.css";

// TODO: Допилить

export default class ExerciseBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "exercise-bar__item"}

    constructor(name) {
        super();

        this._name = name;

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' was triggered")}
        }
    }

    include(dom_node) {
        super.include(dom_node);

        let container = document.createElement("div");
        container.innerHTML = this._name;
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
        this._container.onclick = () => {
            this._callbacks.onclick();
        };
    }
}
