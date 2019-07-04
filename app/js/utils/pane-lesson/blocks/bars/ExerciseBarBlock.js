import BarBlock from "../../core/blocks/BarBlock";
import "../../styles/bars/exercise-bar/exercise-bar.css";

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
        // TODO: create container
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
        let ex_name = `${ex_number}: ${exercise_data.name}`
        let exercise = new ExerciseBarItemBlock(ex_name);
        this.addItem(exercise);
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
