import Module from '../core/Module';

import IdentifierWrapper from "../wrappers/IdentifierWrapper";

// Уникальный ключ сессии
const SESSION_SEED = Math.floor(Math.random() * 1e10);

/**
 * Модуль логирования
 *
 * Сортирует и фильтрует лог-записи.
 * Отвечает за своевременный сбор логов
 */
export default class LogModule extends Module {
// public:

    static get eventspace_name()    {return "log"}
    static get event_types()        {return ["tick", "error"]}

    static defaults() {
        return {
            modeDummy: false,
            tickerInterval: 15000
        }
    }

    constructor(options) {
        super(options);

        this._state = {
            auto: true
        };

        this._client_data = {};

        this._userbuf = {};

        this._collectClientData();

        if (this._options.modeDummy) {
            this._debug.log('Working in DUMMY mode');
        } else {
            this.runTicker(true);
        }
    }

    get client_data() {
        return this._client_data;
    }

    /**
     * Собрать пакет логов
     *
     * В пакет включаются данные клиента и сами логи
     *
     * TODO: обработка логов - фильтрация по разным уровням логирования
     *
     * @param logs
     * @returns {{userData: {}|*, logs: *}}
     */
    collectLogs(logs) {
        if (this._options.modeDummy) {return true}

        return new Promise(resolve => {
            resolve({
                userData: this._client_data,
                logs:     logs
            });
        });
    }

    /**
     * Запустить повторяющийся таймер
     * для периодического сбора лог-записей
     *
     * @param auto {boolean} включить таймер / авто-режим
     * @returns {boolean} true, если модуль в холостом режиме
     */
    runTicker(auto=true) {
        if (this._options.modeDummy) {return true}

        if (!auto) {
            this._state.auto = false;
        }

        setTimeout(() => {
            if (this._state.auto) {
                /// emit tick event but only if no onbeforeupload external event happened
                this.emitEvent("tick");
            }
        }, this._options.tickerInterval);
    }

    addUserAction(channel, data) {
        if (!this._userbuf[channel]) {
            this._userbuf[channel] = [];
        }

        let dt = new Date();

        this._userbuf[channel].push({data, time: dt.getTime()});
    }

    clearUserActions(channel=null) {
        if (channel) {
            delete this._userbuf[channel];
            return;
        }

        this._userbuf = {};
    }

    getUserActions(channel) {
        if (channel) {
            return this._userbuf[channel];
        }

        return this._userbuf;
    }

    /**
     * Собрать данные о клиенте
     *
     * Данные включаются в каждый лог-пакет для идентификации клиента пользователя
     *
     * @returns {boolean} true, если режим холостой
     * @private
     */
    _collectClientData() {
        // if (this._options.modeDummy) {return true}

        let identifier = new IdentifierWrapper();

        this._client_data = {
            sessionSeed:    SESSION_SEED,

            fingerprint:    identifier.fingerprint,
            userAgent:      identifier.userAgent,
            browser:        identifier.browser,
            browserVersion: identifier.browserVersion,
            os:             identifier.OS,
            osVersion:      identifier.OSVersion,
            clientVersion:  "0.0.1"
        }
    }

     /**
     * @inheritDoc
     * @private
     */
    _subscribeToWrapperEvents() {

    }
}