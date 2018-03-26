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
        this._mission_active_deferred   = undefined;
        this._exercise_active_deferred  = undefined;
        this._status_deferred = undefined;
        this._logo_text = undefined;
        this._course_text = undefined;
    }

    inject(dom_node) {
        if (!dom_node) {return false}

        this._lesson_pane.include(dom_node);

        if (this._missions)     {this._lesson_pane.setMissions(this._missions)}
        if (this._course_text)  {this.setCourseText(this._course_text)}
        if (this._logo_text)    {this.setLogoText(this._logo_text)}

        this._state.display = true;

        if (!(this._mission_active_deferred === undefined)) {
            this._lesson_pane.setMissionActive(this._mission_active_deferred);
            this.setMissionText(this._missions[this._mission_active_deferred].name);
            this.setExercises(this._missions[this._mission_active_deferred].exercises);
        }

        if (!(this._exercise_active_deferred === undefined)) {
            this._lesson_pane.setExerciseActive(this._exercise_active_deferred);
        }

        if (!(this._status_deferred === undefined)) {
            this.setStatus(this._status_deferred);
        }

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

        for (let exercise_idx in exercises) {
            let exercise = exercises[exercise_idx];

            exs_arr.push(`Зад. ${exercise.mission} упр. ${exercise.pk}`);
        }


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
        try {
            this._lesson_pane.setExerciseActive(exercise_idx);
        } catch (err) {
            this._exercise_active_deferred = exercise_idx;
        }
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

    setMissionSkidding(mission_idx, on) {
        this._lesson_pane.setMissionSkidding(mission_idx, on);
    }

    onMissionClick(cb) {
        this._lesson_pane.onMissionClick(cb);
    }

    setStatus(status) {
        if (!this._state.display) {
            this._status_deferred = status;
            return;
        }

        switch (status) {
            case 'success': {
                this._lesson_pane.setStatusSuccess();
                break;
            }
            case 'warning': {
                this._lesson_pane.setStatusWarning();
                break;
            }
            case 'error': {
                this._lesson_pane.setStatusError();
                break;
            }
            default: {
                this._lesson_pane.setStatusDefault();
                break;
            }
        }
    }
}

export default LessonPaneWrapper;