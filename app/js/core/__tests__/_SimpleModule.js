import Module from '../Module'

/**
 * Пример минимального модуля
 *
 * Используется для тестирования других компонентов
 */
class SimpleModule extends Module {
// public:

    static get eventspace_name()    {return "sim"}
    static get event_types()        {return ["et0", "et1"]};

    constructor() {
        super();

        this._attached_listeners = {};

        this._subscribeToWrapperEvents();
    }

    /**
     * Вызвать событие модуля
     *
     * @param event_type тип события
     */
    emitEvent(event_type) {
        this._attached_listeners[event_type]();
    }

    _subscribeToWrapperEvents() {
        let self = this;

        this._attached_listeners['et0'] = function() {self._getEventListener('et0')()};
        this._attached_listeners['et1'] = function() {self._getEventListener('et1')()};
    }
}

export default SimpleModule;