import BarItemBlock from "../../core/blocks/BarItemBlock";

import LessonBarLinkBlock from "./LessonBarLinkBlock";

class LessonBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "lesson-bar__item"}
    static get ModifierClassesDOM() {return ["leading"]}

    constructor(number, level_count) {
        super();

        this._number = number;
        this._level_count = level_count;

        this._link = new LessonBarLinkBlock(number, level_count);

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' were triggered")}
        }
    }

    include(dom_node) {
        super.include(dom_node);

        let container = document.createElement("div");
        this._container.appendChild(container);

        this._link.include(container);

        this._attachCallbacks();
    }

    setLeading(on=false) {
        this.setModifierBoolean('leading', on);
    }

    setProgress(level) {
        if (level > this._level_count) {
            throw new RangeError(
                `Level of the lesson bar's item (${level}) cannot be more than maximum (${this._level_count})`
            );
        }

        let percent = level / (this._level_count - 1) * 100;

        this._link.setProgress(percent);
    }

    dispose() {
        if (this._link) {
            this._link.dispose();
        }
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _attachCallbacks() {
        this._link.onClick(() => {this._callbacks.onclick()});
    }
}

export default LessonBarItemBlock;