import Module from '../core/Module';

const URL_REQUESTS = {
    FIRMWARE: 'http://127.0.0.1:8000/fwsvc/geturls/last'
};

class GlobalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "gs"}
    static get event_types()        {return ["error"]};

    constructor() {
        super();
    }

    getUpgradeURLS() {
        return fetch(URL_REQUESTS.FIRMWARE)
            .then((response) => {
                return response.json();
            }).catch((err) => {
                this.emitEvent('error', err);
            });
    }

    /**
     * @inheritDoc
     * @private
     */
    _subscribeToWrapperEvents() {

    }
}

export default GlobalServiceModule;