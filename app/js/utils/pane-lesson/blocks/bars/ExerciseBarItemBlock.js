import BarItemBlock from "../../core/blocks/BarItemBlock";
import "../../styles/bars/exercise-bar/__item/exercise-bar__item.css";

// TODO: Rename (exercise -> ?)
export default class ExerciseBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "exercise-bar__item"}
    static get ModifierClassesDOM() {return ["leading", "passed"]}

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

    highlightLeading(on=false) {
        if (on) {
            this._container.classList.add('highlighted');
        } else {
            this._container.classList.remove('highlighted');
        }
    }

    setPassed(on=false) {
        this.setModifierBoolean('passed', on);
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
