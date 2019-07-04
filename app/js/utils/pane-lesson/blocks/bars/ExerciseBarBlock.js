import BarBlock from "../../core/blocks/BarBlock";
import "../../styles/bars/exercise-bar/exercise-bar.css";

import ExerciseBarItemBlock from "./ExerciseBarItemBlock";

// TODO: Rename (exercise -> ?)
export default class ExerciseBarBlock extends BarBlock {
    static get ClassDOM() {return "exercise-bar"}

    constructor() {
        super();

        this._callbacks = {
            onclick: (idx) => {console.warn("Unhandled event 'click' was triggered with data:", idx)}
        };

        this._state.exerciseActiveIDX = undefined;
    }

    include(dom_node) {
        super.include(dom_node);
    }

    setExercises(exercises) {
        this.clearItems();
        let idx = 1;
        for (let ex of exercises) {
            this.addExercise(ex, idx);
            idx++;
        }
        this._attachCallbacks();
    }

    addExercise(exercise_data, ex_number) {
        let ex_name = `${ex_number}: ${exercise_data.name}`;
        let exercise = new ExerciseBarItemBlock(ex_name);
        this.addItem(exercise);
    }

    setExerciseActive(exercise_idx) {
        if (this._state.exerciseActiveIDX !== undefined) {
            this._items[this._state.exerciseActiveIDX].highlightLeading(false);
        }

        this._items[exercise_idx].highlightLeading(true);

        this._state.exerciseActiveIDX = exercise_idx;
    }

    setProgress(level) {
        if (level > this._items.length) {
            throw new RangeError(`Exercise bar doesn't contain more elements than ${exercise_count}`);
        }

        this.clearProgress();

        for (let i = 0; i < level+1; i++) {
            this._items[i].setPassed(true);
        }
    }

    clearProgress() {
        for (let item of this._items) {
            item.setPassed(false);
        }
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
