import BarBlock from "../../core/blocks/BarBlock";

import LessonBarItemBlock from "./LessonBarItemBlock";

import lessonBarStyle from "../../styles/bars/lesson-bar/lesson-bar";
import thm from "../../styles/bars/lesson-bar/lesson-bar.css";

export default class LessonBarBlock extends BarBlock {
    static get ClassDOM() {return "lesson-bar"}

    static runStyle() {
        lessonBarStyle()
    }

    constructor() {
        super();

        this._callbacks = {
            onclick: (idx) => {console.warn("Unhandled event 'click' was triggered with data:", idx)}
        };

        this._state.missionActiveIDX = undefined;
    }

    include(dom_node) {
        super.include(dom_node);
    }

    setMissionActive(mission_idx) {
        if (!(mission_idx in this._items)) {
            throw new RangeError(`Lesson bar doesn't have an item with number ${mission_idx}`)
        }

        if (this._state.missionActiveIDX !== undefined) {
            this._items[this._state.missionActiveIDX].setLeading(false);
        }

        this._items[mission_idx].setLeading(true);
        this._state.missionActiveIDX = mission_idx;
    }

    setMissionSkidding(mission_idx, is_skidding) {
        if (!(mission_idx in this._items)) {
            throw new RangeError(`Lesson bar doesn't have an item with number ${mission_idx}`)
        }

        this._items[mission_idx].setSkidding(is_skidding);
    }

    setMissionProgress(mission_idx, exercise_count) {
        if (!(mission_idx in this._items)) {
            throw new RangeError(`Lesson bar doesn't have an item with number ${mission_idx}`)
        }

        this._items[mission_idx].setProgress(exercise_count);
    }

    setMissions(missions_data) {
        this.clearItems();

        for (let mission_data of missions_data) {
            this.addMission(mission_data);
        }

        this._attachCallbacks();
    }

    addMission(mission_data) {
        let idx_new = this._items.length + 1;

        let mission = new LessonBarItemBlock(idx_new, mission_data.exercises.length);

        this.addItem(mission);
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