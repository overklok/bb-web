import Loggable from './Loggable';

/**
 * Модули - независимые компоненты приложений.
 * Модули самостоятельны, не знают о существовании приложений и других модулей.
 * Модули не обязательно могут использоваться только приложениями (например, когда состоят из статических методов)
 *
 * Каждый модуль задаёт своё подпространство событий, обладающее своим именем.
 *
 * Задача модуля - предоставить использующему набор методов, которые можно вызывать единично
 * (как команду, без циклов/условий и т.д.).
 *
 * Каждый модуль агрегирует набор функциональностей одного рода. Например:
 *      - Коммуникация
 *      - Рабочая область
 *      - Логирование
 *      - Кэширование настроек среды
 *
 * Модули могут использовать вспомогательные обёртки (см. Wrapper) для реализации функциональностей.
 *
 * Классы-обёртки должны наследоваться от класса Module.
 * Имена классов-модулей именуются в стиле CamelCase с постфиксом Module.
 * Каждый класс должен быть расположен в отдельном одноимённом файле.
 */
class Module extends Loggable {
// public:

    /**
     * @abstract
     */
    static get eventspace_name() {throw new TypeError("This method should be overridden by inheriting classes")}

    /**
     * @abstract
     */
    static get event_types()     {throw new TypeError("This method should be overridden by inheriting classes")}

    constructor() {
        super();

        this.eventspace_name = this.constructor.eventspace_name;
        this.event_types = this.constructor.event_types;

        this._event_listeners = {};
    }

    /**
     * Подключить обработчик событий типа name
     *
     * Вызывается диспетчером.
     * Устанавливает в качестве обработчика событий типа name функцию handler.
     *
     * Если обработчик ещё не был создан, после вызова этой функции последующее создание обработчика
     * не перезапишет имеющийся, если не выбран строгий режим (см. Module._createEventListener())
     *
     * @param {string}      name    имя типа событий
     * @param {Function}    handler функция-обработчик типа событий name
     */
    attachEventListener(name, handler) {
        if (name    === undefined) {console.error('Attaching listener with undefined name is not correct!')}
        if (handler === undefined) {console.error('Attaching listener with undefined handler is not correct!')}
        if (typeof name     !== 'string')    {console.error('Name is not a string!')}
        if (typeof handler  !== 'function')  {console.error('Handler is not a function!')}

        this._event_listeners[name] = handler;
    }

    /**
     * Инициировать событие типа name
     *
     * @param {string} name имя типа события
     * @param {Object} data данные события
     */
    emitEvent(name, data) {
        this._getEventListener(name)(data);
    }

// private:

    /**
     * Создать пустой обработчик событий типа name
     *
     * Пустой обработчик событий - функция, выводящая информацию о том, что обработчик ни к кому не подключён
     *
     * @param {string} name     имя типа событий
     * @param {bool}   strict   перезаписывать ли установленный ранее обработчик (строгий режим)
     * @private
     */
    _createEventListener(name, strict = false) {
        if (!this.event_types.includes(name)) {
            throw new RangeError("This event type name was not registered in the module's event_types() getter");
        }

        if (this._event_listeners[name] === undefined || strict) {
            this._event_listeners[name] = function (data) {
                console.warn("Unattached listener `" + name + "` called with data", data);
            };
        }
    }

    /**
     * Возвратить функцию-обработчик типа событий name
     *
     * Вызывается классами-наледниками в методе _subscribeToWrapperEvents()
     *
     * @param   {string}      name   имя типа событий
     * @returns {Function}           функция-обработчик типа событий name
     * @private
     */
    _getEventListener(name) {
        if (!this.event_types.includes(name)) {
            throw new RangeError("This event type name was not registered in the module's event_types() getter");
        }

        if (this._event_listeners[name] === undefined) {
            this._createEventListener(name);
        }

        return this._event_listeners[name];
    }

    /**
     * Подписаться на события обработчиков
     *
     * Вызывается конструкторами классов-наследников.
     * Создаёт типы событий путём задания в классах-наследниках обработчиков
     *
     * Виртуальный метод: его должен реализовать каждый наследник.
     *
     * @abstract
     */
    _subscribeToWrapperEvents() {
        throw new TypeError("This method should be overridden by inheriting classes");
    }
}

export default Module;