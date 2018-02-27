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
            if (typeof lesson_data === "undefined") {
                throw new TypeError("Lesson data is undefined!");
            }

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
        let chain = new Promise(resolve => {resolve(true)});

        if (mission_idx === this._state.missionIDX) {
            /// спросить подтвержение пользователя
            chain = chain.then(() => this.tourConfirm("Начать задание снова?"))
        }

        chain.then(
            onAccept => {
                if (mission_idx in this._state.missions) {
                    /// обновить индекс миссии
                    this._state.missionIDX = mission_idx;
                    /// определить индекс упражнения в миссии
                    let exercise_idx = this._state.missions[mission_idx].exerciseIDX;

                    return this.launchExercise(exercise_idx);
                }
            },
            onDecline => {
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

        if (verdict.status === API.STATUS_CODES.ERROR) {
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
        this._buttons_model = seq;
        this._state.buttonIDX = 0;
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
        if (lesson_data && lesson_data.missions.length === 0) {
            throw new Error("Lesson has not any missions");
        } else {
            let missions = [];

            for (let mission_idx in lesson_data.missions) {
                let mission = lesson_data.missions[mission_idx];

                if (mission.exercises.length === 0) {continue}

                /// заполнить данные прогресса
                this._state.missions.push({
                    exerciseIDX: 0,
                    exerciseCount: mission.exercises.length
                });

                let exercises = [];

                for (let exercise_idx in mission.exercises) {
                    let exercise = mission.exercises[exercise_idx];

                    let popovers = [];

                    for (let popover_idx in exercise.popovers) {
                        let popover = exercise.popovers[popover_idx];

                        popovers.push({
                            intro: `<h1>${popover.title}</h1>${popover.content}`,
                            position: popover.placement,
                            element: popover.element
                        });
                    }

                    exercise.popovers = popovers;
                    exercises.push(exercise);
                }
                missions.push({
                    name:       mission.name,
                    category:   mission.category,
                    exercises:  exercises
                });
            }

            this._lesson = {
                name:           lesson_data.name,
                description:    lesson_data.description,
                missions:       missions
            };
        }

        console.log(this._lesson);
    }

    _subscribeToWrapperEvents() {
        // stub
    }
}

export default InstructorModule;