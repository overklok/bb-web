import Module from '../core/Module';

import Cookies from 'js-cookie';

/**
 * Модулья для работы с глобальным сервером
 */
class GlobalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "gs"}
    static get event_types()        {return ["error"]}

    static defaults() {
        return {
            origin: 'http://127.0.0.1:8000',
            api: {
                firmware: '/fwsvc/geturls/last',
                log_bunch: '/logsvc/logbunch',
                check_handlers: '/coursesvc/check',
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
     * Отправить код на проверку
     *
     * @param meta      Информация о текущем задании
     * @param handlers  Коды (основной и обработчики)
     * @returns {Promise}   JSON-ответ с результатом проверки / undefined, если в холостом режиме
     */
    commitHandlers(meta, handlers) {
        if (this._options.modeDummy) {return new Promise(resolve => resolve())}

        let packet = {meta: meta, handlers: handlers};

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
                // 'X-CSRFToken': undefined
            },
            method: "POST",
            body: JSON.stringify(packet)
        };

        return fetch(this._options.origin + this._options.api.check_handlers, request)
            .then(response => {
                if (response.error) {
                    throw response.error();
                }

                return response.json();
            }).catch(err => {
                this._debug.error(err);
                this.emitEvent('error', err);
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

        console.log(log_bunch);

        let request = {
            // mode: 'no-cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': this._options.origin,
                // 'Access-Control-Allow-Credentials': true,
                // 'Access-Control-Allow-Methods': 'POST',
                // 'X-CSRFToken': undefined
            },
            method: "POST",
            body: JSON.stringify(log_bunch)
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

export default GlobalServiceModule;