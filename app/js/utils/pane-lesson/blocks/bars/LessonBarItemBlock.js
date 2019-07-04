import BarItemBlock from "../../core/blocks/BarItemBlock";

import LessonBarLinkBlock from "./LessonBarLinkBlock";
import ExerciseBarBlock from "./ExerciseBarBlock";
import exerciseBarStyle from "../../styles/bars/exercise-bar/exercise-bar.js"


let counter = 0;

export default class LessonBarItemBlock extends BarItemBlock {
    static get ClassDOM() {return "lesson-bar__item"}
    static get ModifierClassesDOM() {return ["leading"]}

    constructor(number, exercises) {
        super();

        this._number = number;
        this._level_count = Object.keys(exercises).length;

        this._link = new LessonBarLinkBlock(number, this._level_count, exercises);

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' was triggered")},
            onexerciseclick: () => {console.warn("Unhandled event 'exerciseclick' was triggered")}
        }
        this._exercises = exercises;
        this._list = new ExerciseBarBlock(exercises);
    }

    include(dom_node) {
        super.include(dom_node);

        let container = document.createElement("div");
        this._container.appendChild(container);

        this._link.include(container);

        let list_container = document.createElement("div");
        list_container.id = `exercise-bar-${++counter}`;

        this._list.include(list_container);
        this._list.setExercises(this._exercises);

        document.body.appendChild(list_container);
        exerciseBarStyle(this._container, list_container.id);

        this._attachCallbacks();
    }

    setExerciseActive(exercise_idx) {
        this._list.setExerciseActive(exercise_idx);
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
        this._list.setProgress(level);
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
        // this._link.onExerciseClick((idx) => {this._callbacks.onexerciseclick(idx)});

        this._list.onClick((idx) => {
            this._callbacks.onexerciseclick(idx);
        });
    }
}
