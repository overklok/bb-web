import BarItemBlock from "../../core/blocks/BarItemBlock";

import LessonBarLinkBlock from "./LessonBarLinkBlock";
import ExerciseBarBlock from "./ExerciseBarBlock";

export default class LessonBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "lesson-bar__item"}
    static get ModifierClassesDOM() {return ["leading"]}

    constructor(number, level_count) {
        super();

        this._number = number;
        this._level_count = level_count;

        this._link = new LessonBarLinkBlock(number, level_count);

        // TODO: Допилить
        // this._list = new ExerciseBarBlock(exercises);

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' was triggered")},
            onexerciseclick: () => {console.warn("Unhandled event 'exerciseclick' was triggered")},
        }
    }

    include(dom_node) {
        super.include(dom_node);

        let container = document.createElement("div");
        this._container.appendChild(container);

        this._link.include(container);

        // TODO: Допилить
        // this._list.include(container);

        this._attachCallbacks();
    }

    setLeading(on=false) {
        this.setModifierBoolean('leading', on);

        this._link.setSkiddingDisplay(on);
    }

    setProgress(level) {
        if (level > this._level_count) {
            throw new RangeError(
                `Level of the lesson bar's item (${level}) cannot be more than maximum (${this._level_count})`
            );
        }

        let percent = (level+1) / (this._level_count) * 100;

        this._link.setProgress(percent);
    }

    setSkidding(on=false) {
        this._link.setSkidding(on);
    }

    dispose() {
        if (this._link) {
            this._link.dispose();
        }

        super.dispose();
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    onExerciseClick(cb) {
        this._callbacks.onexerciseclick = cb;
    }

    _attachCallbacks() {
        this._link.onClick(() => {this._callbacks.onclick()});
        this._list.onClick(() => {this._callbacks.onexerciseclick()});
    }
}