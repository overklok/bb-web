import Wrapper from "../core/Wrapper";

import LessonPane from "../~utils/js-lesson-pane/LessonPane";

class LessonPaneWrapper extends Wrapper {
    constructor() {
        super();

        this._state = {
            display: false,
        };

        this._lesson_pane = new LessonPane();

        this._missions = undefined;
        this._mission_active_deferred = undefined;
        this._logo_text = undefined;
        this._course_text = undefined;
    }

    inject(dom_node) {
        if (!dom_node) {return false}

        this._lesson_pane.include(dom_node);

        if (this._missions)     {this._lesson_pane.setMissions(this._missions)}
        if (this._course_text)  {this.setCourseText(this._course_text)}
        if (this._logo_text)    {this.setLogoText(this._logo_text)}

        if (!(this._mission_active_deferred === undefined)) {
            this._lesson_pane.setMissionActive(this._mission_active_deferred);
            this.setMissionText(this._missions[this._mission_active_deferred].name);
            this.setExercises(this._missions[this._mission_active_deferred].exercises);
        }

        this._state.display = true;

        return true;
    }

    registerLogoText(text) {
        this._logo_text = text;
    }

    registerCourseText(text) {
        this._course_text = text;
    }

    registerMissions(missions) {
        this._missions = missions;
    }

    setExercises(exercises) {
        let exs_arr = [];

        for (let exercise_id in exercises) {
            let exercise = exercises[exercise_id];

            exs_arr.push(exercise.name);
        }

        console.log(exs_arr);

        this._lesson_pane.setExercises(exs_arr);
    }

    setLogoText(text) {
        this._lesson_pane.setLogoText(text);
    }

    setCourseText(text) {
        this._lesson_pane.setCourseText(text);
    }

    setMissionText(text) {
        this._lesson_pane.setTaskText(text);
    }

    setExerciseActive(exercise_idx) {
        this._lesson_pane.setExerciseActive(exercise_idx);
    }

    setMissionActive(mission_idx) {
        try {
            this._lesson_pane.setMissionActive(mission_idx);
            this.setMissionText(this._missions[mission_idx].name);
            this.setExercises(this._missions[mission_idx].exercises);
        } catch (err) {
            this._mission_active_deferred = mission_idx;
        }
    }

    setMissionProgress(mission_idx, exercises_passed_count) {
        this._lesson_pane.setMissionProgress(mission_idx, exercises_passed_count);
    }

    onMissionClick(cb) {
        this._lesson_pane.onMissionClick(cb);
    }
}

export default LessonPaneWrapper;