import BarBlock from "../../core/blocks/BarBlock";

import MissionBarItemBlock from "./MissionBarItemBlock";

import thm from "../../styles/bars/mission-bar/mission-bar.css";

export default class MissionBarBlock extends BarBlock {
    static get ClassDOM() {return "mission-bar"}

    constructor() {
        super();

        this._nominalWidth = undefined;

        this._state.exerciseActiveIDX = undefined;
        this._state.stretched = false;

        this._callbacks = {
            onclick: () => {console.warn("Unhandled event 'click' was triggered")}
        }
    }

    include(dom_node) {
        super.include(dom_node);
    }

    stretch() {
        this._container.classList.add('stretched');
        this._state.stretched = true;

        this.setExerciseActive(this._state.exerciseActiveIDX);
    }

    fit() {
        this._container.classList.remove('stretched');
        this._state.stretched = false;

        this.setExerciseActive(false);
    }

    displayProgress(exercise_count) {
        if (exercise_count > this._items.length) {
            throw new RangeError(`Mission bar doesn't contain more elements than ${exercise_count}`);
        }

        for (let i = 0; i <= exercise_count; i++) {
            this._items[i].displayPassed(true);
        }
    }

    setExerciseActive(exercise_idx) {
        if (exercise_idx === false) {
            if (this._state.exerciseActiveIDX !== undefined) {
               this._items[this._state.exerciseActiveIDX].setLeading(false);
               // this._items[this._state.exerciseActiveIDX].highlightLeading(false);
            }

            return;
        }

        if (!(exercise_idx in this._items)) {
            throw new RangeError(`Mission bar doesn't have an item with number ${exercise_idx}`)
        }

        if (this._state.exerciseActiveIDX !== undefined) {
            this._items[this._state.exerciseActiveIDX].setLeading(false);
            this._items[this._state.exerciseActiveIDX].highlightLeading(false);
        }

        if (!this._state.stretched) {
            this._items[exercise_idx].setLeading(true);
        }

        this._items[exercise_idx].highlightLeading(true);

        this._state.exerciseActiveIDX = exercise_idx;
    }

    setExercises(exercises_data) {
        this.clearItems();

        this._state.exerciseActiveIDX = undefined;

        for (let exercise_data of exercises_data) {
            this.addExercise(exercise_data.text, exercise_data.id);
        }

        // if (this._state.stretched) {
        //     this.stretch();
        // }
    }

    addExercise(exercise_data, extra_data) {
        let exercise = new MissionBarItemBlock(exercise_data, extra_data);

        this.addItem(exercise);

        exercise.onClick((data) => {
            if (!this._state.stretched) {
                this._callbacks.onclick(data);
            }
        });
    }

    onClick(cb) {
        this._callbacks.onclick = cb;
    }

    _attachCallbacks() {
        for (let item of this._items) {
            item.onClick((data) => {
                this._callbacks.onclick(data);
            });
        }
    }
}