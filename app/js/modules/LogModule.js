import Module from '../core/Module';

import IdentifierWrapper from "../wrappers/IdentifierWrapper";

/**
 * Модуль логирования
 *
 * Сортирует и фильтрует лог-записи.
 * Отвечает за своевременный сбор логов
 */
class LogModule extends Module {
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

        if (this._options.modeDummy) {
            this._debug.log('Working in DUMMY mode');
        } else {
            this._collectClientData();
            this.runTicker(true);
        }
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

    _collectClientData() {
        if (this._options.modeDummy) {return true}

        let identifier = new IdentifierWrapper();

        this._client_data = {
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

export default LogModule;