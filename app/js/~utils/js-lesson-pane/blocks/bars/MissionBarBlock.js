import BarBlock from "../../core/blocks/BarBlock";

import MissionBarItemBlock from "./MissionBarItemBlock";

import thm from "../../styles/bars/mission-bar/mission-bar.css";

class MissionBarBlock extends BarBlock {
    static get ClassDOM() {return "mission-bar"}

    constructor() {
        super();

        this._state.exerciseActiveIDX = undefined;
    }

    include(dom_node) {
        super.include(dom_node);
    }

    setExerciseActive(exercise_idx) {
        if (exercise_idx === false) {
            if (this._state.exerciseActiveIDX !== undefined) {
               this._items[this._state.exerciseActiveIDX].setLeading(false);
            }

            return;
        }

        if (!(exercise_idx in this._items)) {
            throw new RangeError(`Mission bar doesn't have an item with number ${exercise_idx}`)
        }

        if (this._state.exerciseActiveIDX !== undefined) {
            this._items[this._state.exerciseActiveIDX].setLeading(false);
        }

        this._items[exercise_idx].setLeading(true);
        this._state.exerciseActiveIDX = exercise_idx;
    }

    setExercises(exercises_data) {
        this.clearItems();

        this._state.exerciseActiveIDX = undefined;

        for (let exercise_data of exercises_data) {
            this.addExercise(exercise_data);
        }
    }

    addExercise(exercise_data) {
        let exercise = new MissionBarItemBlock(exercise_data);

        this.addItem(exercise);
    }
}

export default MissionBarBlock;