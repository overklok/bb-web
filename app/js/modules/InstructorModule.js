import Module from "../core/Module";

import TourWrapper from "../wrappers/TourWrapper";

import processLesson from  "../~utils/lesson-processor/processor";

const API = {
    STATUS_CODES: {
        PASS: "OK",
        FAULT: "error"
    }
};

class InstructorModule extends Module {
    static get eventspace_name() {return "ins"}
    static get event_types() {return ["start", "pass", "fault", "finish", "error"]}

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
            missionIDX: undefined,
            missions: [],

            buttonIDX: undefined,
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
            if (!lesson_data) {
                throw new TypeError("No lesson data were provided");
            }

            console.log(lesson_data);

            this._parseLesson(lesson_data);

            resolve(this._lesson.missions);
        });
    }

    launchLesson() {
        return this.launchMission(0);
    }

    /**
     * Запустить следующую миссию
     *
     * @returns {Promise<object>|Promise<void>}
     */
    launchMissionNext() {
        /// определить индекс следующей миссии
        let mission_idx = this._state.missionIDX + 1;

        /// если следующей миссии не существует
        if (mission_idx === this._state.missions.length) {
            /// сообщить диспетчеру о завершении
            this.emitEvent("finish");

            return Promise.resolve();
        } else {
            /// запустить следующую миссию
            return this.launchMission(mission_idx);
        }
    }

    /**
     * Запустить следующее упражнение
     *
     * @returns {Promise<object>|Promise<void>}
     */
    launchExerciseNext() {
        /// определить индекс следующего упражнения
        let exercise_idx = this._state.missions[this._state.missionIDX].exerciseIDX + 1;

        /// если следующего упражнения не существует
        if (exercise_idx === this._state.missions[this._state.missionIDX].exerciseCount) {
            /// запустить следующую миссию
            return this.launchMissionNext();
        } else if (exercise_idx > 0) {
            /// запустить следующее упражнение
            return this.launchExercise(exercise_idx);
        }
    }

    /**
     * Запустить миссию
     *
     * @param mission_idx
     * @returns {boolean}
     */
    launchMission(mission_idx) {
        let chain = new Promise(resolve => {resolve(false)});

        if (mission_idx === this._state.missionIDX) {
            /// спросить подтвержение пользователя
            chain = chain.then(() => this.tourConfirm("Начать задание снова?"))
        }

        chain.then(
            reset => {
                if (mission_idx in this._state.missions) {
                    /// обновить индекс миссии
                    this._state.missionIDX = mission_idx;
                    /// определить индекс упражнения в миссии
                    let exercise_idx = reset ? 0 : this._state.missions[mission_idx].exerciseIDX;

                    return this.launchExercise(exercise_idx);
                }
            },
            skip => {
                return false;
            }

        );

        return chain;
    }

    /**
     * Запустить упражнение
     *
     * @param exercise_idx
     * @returns {Promise<object>}
     */
    launchExercise(exercise_idx) {
        let mission_idx = this._state.missionIDX;

        /// если индекс упражнения находится в допустимых пределах
        if (0 <= exercise_idx && exercise_idx < this._state.missions[mission_idx].exerciseCount) {
            /// обновить заданный индекс упражнения в текущей миссии
            this._state.missions[mission_idx].exerciseIDX = exercise_idx;

            /// извлечь данные упражнения
            let exercise_data = this._lesson.missions[mission_idx].exercises[exercise_idx];

            /// сообщить диспетчеру о запуске упражнения
            this.emitEvent("start", exercise_data);

            /// сообщить вызывающей программе о запуске упражнения
            return Promise.resolve(exercise_data);
        } else {
            throw new Error(`Exercise ${exercise_idx} in mission ${mission_idx} not found`);
        }
    }

    /**
     * Показать введение в упражнение
     *
     * @returns {Promise<any>}
     */
    tourIntro(popovers) {
        /// Если нет поповеров, выйти
        if (!popovers) {return Promise.resolve()}

        /// Подключить поповер-обёртку
        let intro = new TourWrapper("intro", popovers);
        /// Запустить интро
        return intro.start();
    }

    /**
     * Показать сообщение о прохождении упражнения
     *
     * TODO
     * @stub
     *
     * @param message
     */
    tourPass(message) {
        message = message || "Упражнение пройдено!";
        /// Подключить поповер-обёртку
        let intro = new TourWrapper("success", message);
        /// Запустить интро
        return intro.start();
    }

    /**
     * Показать сообщение о провале упражнения
     *
     * TODO
     * @stub
     *
     * @param message
     */
    tourFault(message) {
        message = message || "Упражнение не пройдено";
        /// Подключить поповер-обёртку
        let intro = new TourWrapper("error", [{
            intro: message
        }]);
        /// Запустить интро
        return intro.start();
    }

    /**
     * Вывести диалоговое сообщение о подтверждении
     *
     * @param question_text
     * @returns {Promise<any>} resolve, если ответ "Да", reject - если "Нет"
     */
    tourConfirm(question_text) {
        let intro = new TourWrapper("dialog", question_text);

        return intro.start();
    }

    getExerciseID() {
        let missionIDX = this._state.missionIDX;
        let exerciseIDX = this._state.missions[missionIDX].exerciseIDX;

        return this._lesson.missions[missionIDX].exercises[exerciseIDX].pk;
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
        if (code === this._buttons_model[this._state.buttonIDX]) {
            /// если ожидаемый код - последний
            if ((this._state.buttonIDX + 1) === this._buttons_model.length) {
                /// сбросить позицию указателя
                this._state.buttonIDX = 0;
                /// задание пройдено
            } else {
                /// увеличить позицию указателя
                this._state.buttonIDX += 1;
            }

            return true;
        }

        /// сбросить позицию указателя, если код не совпал
        this._state.buttonIDX = 0;

        return false;
    }

    /**
     * Установить эталонную последовательность нажатий клавиш
     *
     * @param {Array<number>} seq эталонная последовательность нажатий клавиш
     * @private
     */
    setButtonsModel(seq) {
        if (!seq) return Promise.resolve(false);

        this._buttons_model = seq;
        this._state.buttonIDX = 0;

        return Promise.resolve(true);
    }

    /**
     * Обработать данные урока и установить их в объект
     *
     * Происходит сброс данных прогресса
     *
     * @param lesson_data
     * @private
     */
    _parseLesson(lesson_data) {
        this._lesson = processLesson(lesson_data);

        for (let mission of this._lesson.missions) {
            /// заполнить данные прогресса
            this._state.missions.push({
                exerciseIDX: 0,
                exerciseCount: mission.exercises.length
            });
        }

        console.log(this._lesson);
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default InstructorModule;