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

        this._lesson = undefined;
        this._buttons_model = [];

        this._state = {
            missionID: 0,
            exerciseID: -1,

            buttonID: undefined,
        };

        this._subscribeToWrapperEvents();
    }

    /**
     * Выдать ИД начального урока
     *
     * Определяет номер урока в зависимости от входных данных
     * модуля
     *
     * @param {number} lesson_id (опционально) ИД урока
     * @returns {Promise<number>} ИД урока
     */
    getInitialLessonID(lesson_id) {
        return new Promise(resolve => {
            if (lesson_id) {
                resolve(lesson_id);
            } else {
                resolve(this._options.lessonID);
            }
        });
    }

    /**
     * Загрузить урок в модуль
     *
     * Происходит первичная обработка данных и установка указателей
     *
     * @param lesson_data {object} JSON-пакет с данными урока
     * @returns {Promise<any>}
     */
    loadLesson(lesson_data) {
        return new Promise(resolve => {
            if (typeof lesson_data === "undefined") {
                throw new TypeError("Lesson data is undefined!");
            }

            this._resetPointers();
            this._parseLesson(lesson_data);

            resolve(this._lesson.missions);
        });
    }

    /**
     * TODO
     *
     * @param mission_idx
     * @returns {boolean}
     */
    launchMission(mission_idx) {
        if (mission_idx === this._state.missionID) {
            if (this._state.exerciseID === 0) {
                return false;
            } else {
                /// reset mission
            }
        }

        this._state.missionID = mission_idx;
        this._state.exerciseID = -1;

        this.launchExerciseNext();
    }

    /**
     * Запустить следующее упражнение
     */
    launchExerciseNext() {
        let mid = this._state.missionID;
        let eid = this._state.exerciseID;

        if (mid in this._lesson.missions) {
            /// если миссия существует
            if (++eid in this._lesson.missions[mid].exercises) {
                /// если следующее упражнение существует
                let exer_data = this._lesson.missions[mid].exercises[eid].fields;

                console.log("NEXT EXER EXISTS");
                this._state.exerciseID++;

                this.emitEvent("start", exer_data);
                return this._parseExercise(exer_data);
            } else {
                console.log("NEXT EXER NOT EXISTS");
                /// если следующее упражнение - последнее
                return this._goToNextMission();
            }
        } else {
            /// завершена последняя миссия
            console.log("GOT LAST MISSION");
            /// finish lesson
            return Promise.resolve();
        }
    }

    /**
     * Обработать результат проверки упражнения
     *
     * @param verdict
     */
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

    /**
     * Проверить правильность нажатия клавиши
     *
     * @param code
     * @returns {boolean}
     */
    validateButtonPress(code) {
        if (typeof this._buttons_model === "undefined") {
            return true;
        }

        /// если последовательность пустая, пройдено автоматически
        if (this._buttons_model.length === 0) {
            /// задание пройдено
        }

        /// если код нажатой клавиши совпал с ожидаемым
        if (code === this._buttons_model[this._state.buttonID]) {
            /// если ожидаемый код - последний
            if ((this._state.buttonID + 1) === this._buttons_model.length) {
                /// сбросить позицию указателя
                this._state.buttonID = 0;
                /// задание пройдено
            } else {
                /// увеличить позицию указателя
                this._state.buttonID += 1;
            }

            return true;
        }

        /// сбросить позицию указателя, если код не совпал
        this._state.buttonID = 0;

        return false;
    }

    /**
     * Установить эталонную последовательность нажатий клавиш
     *
     * @param {Array<number>} seq эталонная последовательность нажатий клавиш
     * @private
     */
    _setModelButtonSequence(seq) {
        this._buttons_model = seq;
        this._state.buttonID = 0;
    }

    /**
     * Обработать данные урока и установить их в объект
     *
     * @param lesson_data
     * @private
     */
    _parseLesson(lesson_data) {
        if (lesson_data && lesson_data.missions.length === 0) {
            throw new Error("Lesson has not any missions");
        } else {
            this._lesson = lesson_data;
        }
    }

    _parseExercise(exercise_data) {
        console.log("Parse EXER", exercise_data);
        if (exercise_data.popovers && exercise_data.popovers.length > 0) {
            /// Если поповеры существуют
            console.log("popovers EXIST");
            let popovers = this._parsePopovers(exercise_data.popovers);

            console.log(popovers);
            let intro = new TourWrapper("intro", popovers);
            return intro.start();
        } else {
            /// Если поповеров нет
            console.log("popovers NOT EXIST")
            return Promise.resolve();
        }
    }

    _parsePopovers(popovers) {
        let pops = [];

        for (let popover of popovers) {
            let html = popover.fields.title ? '<h1>' + popover.fields.title + '</h1>' : "";
            html += popover.fields.content;

            pops.push({
                intro: html,
                position: popover.fields.placement
            });
        }

        return pops;
    }

    /**
     * Сбросить указатели прогресса в исходное состояние
     *
     * @private
     */
    _resetPointers() {
        this._state.missionID   = 0;
        this._state.exerciseID  = -1;
    }

    /**
     * Перейти к следующей миссии
     *
     * @private
     */
    _goToNextMission() {
        this._state.missionID++;
        this._state.exerciseID = -1;

        return this.launchExerciseNext();
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default InstructorModule;