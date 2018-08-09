import Module from '../core/Module';

import Cookies from 'js-cookie';

/**
 * Модуль для работы с глобальным сервером
 */
export default class GlobalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "gs"}
    static get event_types()        {return ["error"]}

    static defaults() {
        return {
            origin: 'http://127.0.0.1:8000',
            api: {
                lesson: '/coursesvc/lesson/',
                firmware: '/fwsvc/geturls/last/',
                log_bunch: '/logsvc/logbunch/',
                check_handlers: '/coursesvc/check/',
                calc_currents: '/coursesvc/calc/',
                courses: '/coursesvc/',
            },
            admin: {
                exercise: '/admin/coursesvc/exercise/{id}/change'
            },
            csrfRequired: true,
            modeDummy: false
        }
    }

    constructor(options) {
        super(options);

        this._csrfToken = undefined;

        if (this._options.csrfRequired) {
            this._configureCSRF();
        }

        this._subscribeToWrapperEvents();
    }

    /**
     * Перевести браузер на страницу с уроками
     *
     * Используется заданный в конфигурации адрес сервера
     */
    goToLessonPage() {
        window.open(this._options.origin);
    }

    goToExerciseAdminPage(exercise_id) {
        if (!exercise_id) {
            throw new ParameterError("Parameter `exercise_id` should be specified");
        }

        window.open(
            this._options.origin + String(this._options.admin.exercise).formatUnicorn({id: exercise_id}),
            '_blank'
        );
    }

    /**
     * Получить данные урока
     *
     * @param   {number|string} lesson_id  ИД урока
     *
     * @returns {Promise<any>}  данные урока
     */
    getLessonData(lesson_id) {
        if (this._options.modeDummy) {return new Promise(resolve => resolve())}

        return new Promise((resolve, reject) => {
            fetch(this._options.origin + this._options.api.lesson + lesson_id)
                .then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.json());
                    } else {
                        let error = new Error(response.statusText || response.status);
                        error.response = response;

                        reject(error);
                    }
                }).catch(err => {
                    this._debug.error(err);
                    reject(err);
                });
        });
    }

    getCoursesData() {
        if (this._options.modeDummy) {return new Promise(resolve => resolve())}

        return new Promise((resolve, reject) => {
            fetch(this._options.origin + this._options.api.courses)
                .then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.json());
                    } else {
                        let error = new Error(response.statusText || response.status);
                        error.response = response;

                        reject(error);
                    }
                }).catch(err => {
                    this._debug.error(err);
                    reject(err);
                });
        });
    }

    /**
     * Отправить решение на проверку
     *
     * @param   {number}    exercise_id ИД текущего задания
     * @param   {object}    solution    Решение задания
     *                                  {handlers: Коды (основной и обработчики), board: Данные состояния платы}
     *
     * @returns {Promise}   JSON-ответ с результатом проверки / undefined, если в холостом режиме
     */
    commitSolution(exercise_id, solution) {
        if (this._options.modeDummy) {return Promise.resolve()}

        if (typeof exercise_id !== "number") {return Promise.reject(new TypeError("Exercise ID is not a number"))}

        return new Promise((resolve, reject) => {
            let packet = {handlers: solution.handlers, board: solution.board};

            // let data = new FormData();
            // data.append("json", JSON.stringify(packet));

            let request = {
                // mode: 'no-cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Access-Control-Allow-Origin': this._options.origin,
                    // 'Access-Control-Allow-Credentials': true,
                    // 'Access-Control-Allow-Methods': 'POST',
                    'X-CSRFToken': this._csrfToken
                },
                method: "POST",
                body: JSON.stringify(packet),
                credentials: 'same-origin',
            };


            return fetch(this._options.origin + this._options.api.check_handlers + exercise_id + '/', request)
                .then(response => {
                    if (response.error) {
                        reject(response.error())
                    }

                    resolve(response.json());
                }).catch(err => {
                    this._debug.error(err);
                    reject(err);
                });
        });
    }

    /**
     * Отправить лог-записи
     *
     * @param log_bunch собранный пакет лог-записей
     * @returns {Promise} Ответ сервера / undefined, если в холостом режиме
     */
    reportLogBunch(log_bunch) {
        if (this._options.modeDummy) {return new Promise(resolve => resolve())}

        // let data = new FormData();
        // data.append("json", JSON.stringify(log_bunch));

        let request = {
            // mode: 'no-cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'Access-Control-Allow-Origin': this._options.origin,
                // 'Access-Control-Allow-Credentials': true,
                // 'Access-Control-Allow-Methods': 'POST',
                'X-CSRFToken': this._csrfToken
            },
            method: "POST",
            body: JSON.stringify(log_bunch),
            credentials: 'same-origin'
        };

        return fetch(this._options.origin + this._options.api.log_bunch, request)
            .then(response => {
                return response;
            }).catch(err => {
                this._debug.error(err);
                this.emitEvent('error', err);
            });
    }

    /**
     * Отправить запрос на получение ссылок на прошивку платы
     *
     * @returns {Promise} массив ссылок на файлы прошивки платы / [], если в холостом режиме
     */
    getUpgradeURLs() {
        if (this._options.modeDummy) {return new Promise(resolve => {resolve([])})}

        return fetch(this._options.origin + this._options.api.firmware)
            .then(response => {
                return response.json();
            }).catch(err => {
                this._debug.error(err);
                this.emitEvent('error', err);
            });
    }

    /**
     * @deprecated
     *
     * @param plates
     * @param extra_num
     * @returns {Promise<any>}
     */
    calcCurrents(plates, extra_num) {
        if (this._options.modeDummy) {return new Promise(resolve => {resolve([])})}

        if (!plates) {return new Promise(resolve => {resolve([])})}

        return new Promise((resolve, reject) => {
            let packet = {elements: plates, num: extra_num};
            // let data = new FormData();
            // data.append("json", JSON.stringify(packet));

            let request = {
                // mode: 'no-cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'Access-Control-Allow-Origin': this._options.origin,
                    // 'Access-Control-Allow-Credentials': true,
                    // 'Access-Control-Allow-Methods': 'POST',
                    'X-CSRFToken': this._csrfToken
                },
                method: "POST",
                body: JSON.stringify(packet),
                credentials: 'same-origin',
            };

            return fetch(this._options.origin + this._options.api.calc_currents, request)
                .then(response => {
                    if (response.error) {
                        reject(response.error())
                    }

                    resolve(response.json());
                }).catch(err => {
                    this._debug.error(err);
                    reject(err);
                });
        });
    }

    /**
     * Получить CSRF-токен (если есть)
     *
     * @returns {boolean} true, если модуль в холостом режиме
     * @private
     */
    _configureCSRF() {
        if (this._options.modeDummy) {return true}

        this._csrfToken = Cookies.get('csrftoken');

        if (typeof this._csrfToken === "undefined") {
            throw new Error("This application loaded from invalid server");
        }
    }

    /**
     * @inheritDoc
     * @private
     */
    _subscribeToWrapperEvents() {
        if (this._options.modeDummy) {
            this._debug.log("Working in DUMMY mode");
        }
    }
}