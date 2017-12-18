class Dispatcher {
    constructor() {
        this._handlers = [];
    }

    subscribe(module) {
        let self = this;

        listeners = module.getEventListeners();

        listeners.forEach(function(name, listener) {
            listeners[i].handler = function (data) {
                self._getHandler(name, data);
            };
        });
    }

    on(name, handler) {
        if (typeof name     !== 'string')    {console.error('Name is not a string!')}
        if (typeof handler  !== 'function')  {console.error('Handler is not a function!')}

        this._handlers[name] = handler;
    }

    _getHandler(name, data) {
        if (typeof name     !== 'string')    {console.error('Name is not a string!')}

        return this._handlers[name](data);
    }
}

export default Dispatcher;