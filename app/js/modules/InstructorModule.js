import Module from "../core/Module";

import TourWrapper from "../wrappers/TourWrapper";

const API = {
    STATUS_CODES: {
        PASS: "OK",
        FAULT: "error"
    }
};

class InstructorModule extends Module {
    static get eventspace_name() {return "ins"}
    static get event_types() {return ["start", "pass", "fault", "error"]}

    static defaults() {
        return {
            lessonID: 1
        }
    }

    constructor(options) {
        super(options);

        this._tour = new TourWrapper();

        this._lesson = undefined;

        this._state = {
            missionID: -1,
            exerciseID: -1,
        };

        this._valid_button_seq = [];
        this._seq_pointer_pos = undefined;

        this._subscribeToWrapperEvents();
    }

    getInitialLessonID(lesson_id) {
        return new Promise(resolve => {
            if (lesson_id) {
                resolve(lesson_id);
            } else {
                resolve(this._options.lessonID);
            }
        });
    }

    launchLesson(lesson_data) {
        return new Promise(resolve => {
            if (typeof lesson_data === "undefined") {
                resolve();
            }

            this._parseLesson(lesson_data);

            resolve();
        })
    }

    applyVerdict(verdict) {
        if (verdict.status === API.STATUS_CODES.PASS) {
            this.emitEvent("pass", {
                message: "молодец продолжай дальше"
            });
        }

        if (verdict.status === API.STATUS_CODES.FAULT) {
            this.emitEvent("fault", {
                message: verdict.html,
                blocks: verdict.blocks
            });
        }
    }

    validateButtonPress(code) {
        if (typeof this._valid_button_seq === "undefined") {
            return true;
        }

        /// если код нажатой клавиши совпал с ожидаемым
        if (code === this._valid_button_seq[this._seq_pointer_pos]) {
            /// если ожидаемый код - последний
            if ((this._seq_pointer_pos + 1) === this._valid_button_seq.length) {
                /// сбросить позицию указателя
                this._seq_pointer_pos = 0;
            } else {
                /// увеличить позицию указателя
                this._seq_pointer_pos += 1;
            }

            return true;
        }

        /// сбросить позицию указателя, если код не совпал
        this._seq_pointer_pos = 0;

        return false;
    }

    setValidButtonSequence(seq) {
        this._valid_button_seq = seq;
        this._seq_pointer_pos = 0;
    }

    _parseLesson(lesson_data) {
        if (lesson_data.missions.length === 0) {
            /// finish lesson
        } else {
            this._lesson = lesson_data;
            this._goToNextMission();
            this._runNextExercise();
        }
    }

    _runNextExercise() {
        let mid = this._state.missionID;
        let eid = this._state.exerciseID;

        if (mid in this._lesson.missions) {
            /// если миссия существует
            if (++eid in this._lesson.missions[mid].exercises) {
                /// если следующее упражнение существует
                this.emitEvent("start", this._lesson.missions[mid].exercises[eid].fields);
                this._state.exerciseID++;
            } else {
                /// если следующее упражнение - последнее
                this._goToNextMission();
            }
        } else {
            /// завершена последняя миссия
        }
    }

    _goToNextMission() {
        this._state.missionID++;
    }


    _subscribeToWrapperEvents() {
        // stub
    }
}

export default InstructorModule;