import Module from '../core/Module';

const UPGRD_URLS_STUB = [
    'http://127.0.0.1:8000/static/firmwares/test.txt'
];

class GlobalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "gs"}
    static get event_types()        {return []};

    constructor() {
        super();
    }

    getUpgradeURLS() {
        return UPGRD_URLS_STUB;
    }

    /**
     * @inheritDoc
     * @private
     */
    _subscribeToWrapperEvents() {

    }
}

export default GlobalServiceModule;