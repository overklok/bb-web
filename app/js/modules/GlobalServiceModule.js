import Module from '../core/Module';

import Cookies from 'js-cookie';

// TODO: сделать динамическим через конфиг
const ORIGIN = 'http://127.0.0.1:8000';

const URL_REQUESTS = {
    FIRMWARE:   ORIGIN      + '/fwsvc/geturls/last',
    LOG_BUNCH:  ORIGIN      + '/logsvc/logbunch',
    CHECK_HANDLERS: ORIGIN  + '/coursesvc/check'
};

class GlobalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "gs"}
    static get event_types()        {return ["error"]};

    static defaults() {
        return {
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

    commitCode(meta, handlers) {
        if (this._options.modeDummy) {return true}

        let packet = {meta: meta, handlers: handlers};

        // let data = new FormData();
        // data.append("json", JSON.stringify(packet));

        let request = {
            mode: 'no-cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'Access-Control-Allow-Origin': ORIGIN,
                // 'Access-Control-Allow-Credentials': true,
                // 'Access-Control-Allow-Methods': 'POST',
                // 'X-CSRFToken': undefined
            },
            method: "POST",
            body: JSON.stringify(packet)
        };

        return fetch(URL_REQUESTS.CHECK_HANDLERS, request)
            .then(response => {
                return response;
            }).catch(err => {
                this._debug.error(err);
                this.emitEvent('error', err);
            });
    }

    reportLogBunch(log_bunch) {
        if (this._options.modeDummy) {return true}

        // let data = new FormData();
        // data.append("json", JSON.stringify(log_bunch));

        console.log(log_bunch);

        let request = {
            mode: 'no-cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'Access-Control-Allow-Origin': ORIGIN,
                // 'Access-Control-Allow-Credentials': true,
                // 'Access-Control-Allow-Methods': 'POST',
                // 'X-CSRFToken': undefined
            },
            method: "POST",
            body: JSON.stringify(log_bunch)
        };

        return fetch(URL_REQUESTS.LOG_BUNCH, request)
            .then(response => {
                return response;
            }).catch(err => {
                this._debug.error(err);
                this.emitEvent('error', err);
            });
    }

    getUpgradeURLs() {
        if (this._options.modeDummy) {return true}

        return fetch(URL_REQUESTS.FIRMWARE)
            .then(response => {
                return response.json();
            }).catch(err => {
                this._debug.error(err);
                this.emitEvent('error', err);
            });
    }

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