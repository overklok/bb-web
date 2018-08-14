import BarItemBlock from "../../core/blocks/BarItemBlock";

import thm from "../../styles/bars/mission-bar/__item/mission-bar__item.css";

export default class MissionBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "mission-bar__item"}
    static get ModifierClassesDOM() {return ["leading", "passed"]}

    constructor(text, data) {
        super();

        this._data = data;
        this._text = text;

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' was triggered")}
        }
    }

    include(dom_node) {
        super.include(dom_node);

        this._container.innerHTML = this._text;

        this._attachCallbacks();
    }

    setLeading(on=false) {
        this.setModifierBoolean('leading', on);
    }

    highlightLeading(on=false) {
        if (on) {
            this._container.classList.add('highlighted');
        } else {
            this._container.classList.remove('highlighted');
        }
    }

    displayPassed(on=false) {
        this.setModifierBoolean('passed', on);
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _attachCallbacks() {
        this._container.onclick = () => {
            this._callbacks.onclick(this._data);
        };
    }
}