import Module from '../core/Module'

import SocketWrapper from '../wrappers/SocketWrapper'


class LocalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "ls"}
    static get event_types()        {return ["connect", "disconnect"]};

    constructor() {
        super();

        this._socket = new SocketWrapper();

        this._subscribeToWrapperEvents();
    }

    _subscribeToWrapperEvents() {
        let self = this;

        this._socket.on('connect',    function() {self._getEventListener('connect')()});
        this._socket.on('disconnect', function() {self._getEventListener('disconnect')()});
    }
}

export default LocalServiceModule;