import Wrapper from "../core/Wrapper";

import PaneLesson from "../utils/pane-lesson/PaneLesson";

export default class LessonPaneWrapper extends Wrapper {
    constructor(emphasize=false) {
        super();

        this._state = {
            display: false,
        };

        this._plugin = new PaneLesson(emphasize);

        this._missions = undefined;
        this._mission_active_deferred   = undefined;
        this._exercise_active_deferred  = undefined;
        this._menu_structure_deferred = undefined;
        this._task_on_deferred = undefined;
        this._status_deferred = undefined;
        this._logo_text = undefined;
        this._lesson_text = undefined;
    }

    inject(dom_node) {
        if (!dom_node) {return false}
        if (this._state.display) {return true}

        this._plugin.include(dom_node);

        if (this._missions)     {this._plugin.setMissions(this._missions)}
        if (this._lesson_text)  {this.setLessonText(this._lesson_text)}
        if (this._logo_text)    {this.setLogoText(this._logo_text)}

        this._state.display = true;

        if (!(this._mission_active_deferred === undefined)) {
            this._plugin.setMissionActive(this._mission_active_deferred);
            this.setMissionText(this._missions[this._mission_active_deferred].name);
            this.setExercises(this._missions[this._mission_active_deferred].exercises);
        }

        if (!(this._exercise_active_deferred === undefined)) {
            this._plugin.setExerciseActive(this._exercise_active_deferred);
        }

        if (!(this._status_deferred === undefined)) {
            this.setStatus(this._status_deferred);
        }

        if (!(this._menu_structure_deferred === undefined)) {
            this.setMenuStructure(this._menu_structure_deferred);
        }

        if (!(this._task_on_deferred === undefined)) {
            this.switchTask(this._task_on_deferred);
        }

        return true;
    }

    registerLogoText(text) {
        this._logo_text = text;
    }

    registerLessonText(text) {
        this._lesson_text = text;
    }

    setMissions(missions) {
        this._missions = missions;

        if (this._state.display) {
            this._plugin.setMissions(this._missions);
        }
    }

    setExercises(exercises) {
        let exs_arr = [];

        for (let exercise_idx in exercises) {
            let exercise = exercises[exercise_idx];

            exs_arr.push({
                text: `Зад. ${exercise.mission} упр. ${exercise.pk}`,
                id: exercise.pk
            });
        }


        this._plugin.setExercises(exs_arr);
    }

    setLogoText(text) {
        this._plugin.setLogoText(text);
    }

    setLessonText(text) {
        this._plugin.setLessonText(text);
    }

    setMissionText(text) {
        this._plugin.setTaskText(text);
    }

    setExerciseActive(exercise_idx) {
        try {
            this._plugin.setExerciseActive(exercise_idx);
        } catch (err) {
            if (err.code === "ENOCON") {
                // console.warn("setExerciseActive: called too early; setting deferred value");
                this._exercise_active_deferred = exercise_idx;
            } else {
                throw err;
            }
        }
    }

    setMissionActive(mission_idx) {
        try {
            this._plugin.setMissionActive(mission_idx);
            this.setMissionText(this._missions[mission_idx].name);
            this.setExercises(this._missions[mission_idx].exercises);
        } catch (err) {
            if (err.code === "ENOCON") {
                // console.warn("setMissionActive: called too early; setting deferred value");
                this._mission_active_deferred = mission_idx;
            } else {
                throw err;
            }
        }
    }

    setMissionProgress(mission_idx, exercises_passed_count) {
        this._plugin.setMissionProgress(mission_idx, exercises_passed_count);
    }

    setMissionSkidding(mission_idx, on) {
        this._plugin.setMissionSkidding(mission_idx, on);
    }

    setMenuStructure(structure) {
        try {
            this._plugin.setMenuStructure(structure);
        } catch (err) {
            if (err.code === "ENOCON") {
                // console.warn("setMenuStructure: called too early; setting deferred value");
                this._menu_structure_deferred = structure;
            } else {
                throw err;
            }
        }
    }

    switchTask(on) {
        try {
            if (on) {
                this._plugin.showTask();
            } else {
                this._plugin.hideTask();
            }
        } catch (err) {
            if (err.code === "ENOCON") {
                // console.warn("setMenuStructure: called too early; setting deferred value");
                this._task_on_deferred = on;
            } else {
                throw err;
            }
        }
    }

    setStatus(status) {
        if (!this._state.display) {
            this._status_deferred = status;
            return;
        }

        switch (status) {
            case 'success': {
                this._plugin.setStatusSuccess();
                break;
            }
            case 'warning': {
                this._plugin.setStatusWarning();
                break;
            }
            case 'error': {
                this._plugin.setStatusError();
                break;
            }
            case 'active': {
                this._plugin.setStatusActive();
                break;
            }
            default: {
                this._plugin.setStatusDefault();
                break;
            }
        }
    }

    switchMenu(on) {
        this._plugin.switchMenu(on);
    }

    emphasize(on) {
        this._plugin.emphasize(on);
    }

    onMenuClick(cb) {
        this._plugin.onMenuClick(cb);
    }

    onMissionClick(cb) {
        this._plugin.onMissionClick(cb);
    }

    onReturnClick(cb) {
        this._plugin.onReturnClick(cb);
    }

    onExerciseClick(cb) {
        this._plugin.onExerciseClick(cb);
    }

    onStatusClick(cb) {
        this._plugin.onStatusClick(cb);
    }
}