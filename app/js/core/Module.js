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
 * Каждый модуль агрегирует функциональность одного рода. Например:
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
export default class Module extends Loggable {
// public:

    /**
     * @abstract
     *
     * @type {string} имя пространства событий
     */
    static get eventspace_name() {throw new TypeError("This method should be overridden by inheriting classes")}

    /**
     * @abstract
     *
     * @type {Array} массив типов событий
     */
    static get event_types()     {throw new TypeError("This method should be overridden by inheriting classes")}

    /**
     * Установить опции по умолчанию
     *
     * Метод должен возвращать объект, в котором ключи означают
     * настройки, а значения - их опции по умолчанию
     *
     * Вызывается конструкторами классов-наслдеников
     * Заданные настройки и опции по умолчанию используются впоследствии методом _coverOptions(),
     * передающим опции из конструктора во внутренний атрибут объекта this._options
     *
     * @abstract
     */
    static defaults() {
        // throw new TypeError("_setDefaults() should be overridden by inherited classes");
        return {};
    }

    /**
     * Создать экземпляр модуля
     *
     * После этой операции диспетчер можно подписывать на события этого модуля
     *
     * @param {Object} options опции модуля в формате, задаваемом в методе {@link defaults}
     */
    constructor(options) {
        options = options || {};
        super(options);

        /// Загрузить опции по умолчанию, перекрыть их кастомными опциями
        /** @type {Object} опции модуля по умолчанию */
        this.__defaults = this.constructor.defaults();
        /** @type {Object} обработанные опции модуля */
        this._options   = this._coverOptions(this.__defaults, options);

        /** @type {string} имя пространства событий модуля */
        this.eventspace_name    = this.constructor.eventspace_name;
        /** @type {Array} типы событий модуля */
        this.event_types        = this.constructor.event_types;

        /** @type {Object} обработчики событий модуля */
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
     * Метод не является асинхронным.
     * При вызове из модуля блокируется на время выполнения
     * кода обработчика события
     *
     * @param {string} name имя типа события
     * @param {Object} data данные события
     */
    emitEvent(name, data) {
        this._getEventListener(name)(data);
    }

    switchDummyMode(on) {
        this._options.modeDummy = on ? true : false;
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
                console.warn("Unattached listener `" + name + "` called with data", data,
                    "(did you subscribe dispatcher to this module?)");
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
     * @private
     */
    _subscribeToWrapperEvents() {
        throw new TypeError("_subscribeToWrapperEvents() should be overridden by inherited classes");
    }

    /**
     * Наложить заданные опции поверх опций по умолчанию и сохранить в объект
     * в соответствии с настройками, заданными в defaults()
     *
     * TODO: критическая функция, нужно покрывать тестами
     *
     * @private
     */
    _coverOptions(defaults, options) {
        /// Если не заданы настройки с опциями по умолчанию - выдать пустой объект
        if (typeof defaults === "undefined") return {};
        /// Если не заданы опции - выдать опции по умолчанию
        if (typeof options === "undefined") return defaults;
        /// Если настроек нет - выдать пустой объект
        // if (Object.keys(defaults).length === 0) return 'undefined';

        /// Если options - не объект, то возвратить значение
        if (typeof options !== 'object') return options;

        let settings = {};

        /// Для каждой заданной опции выполнить рекурсивно поиск опции
        for (let setting of Object.keys(defaults)) {
            settings[setting] = this._coverOptions(defaults[setting], options[setting]);
        }

        return settings;
    }
}