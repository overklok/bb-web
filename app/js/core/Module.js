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
class Module {
    static get eventspace_name() {throw new TypeError("This method should be overridden by inheriting classes")}

    constructor() {
        this._event_listeners = [];

        console.log(this.constructor.eventspace_name);
    }

    _attachListener(name, handler) {
        if (name    === undefined) {console.error('Attaching listener with undefined name is not correct!')}
        if (handler === undefined) {console.error('Attaching listener with undefined handler is not correct!')}
        if (typeof name     !== 'string')    {console.error('Name is not a string!')}
        if (typeof handler  !== 'function')  {console.error('Handler is not a function!')}

        this._event_listeners[name] = handler;
    }
}

export default Module;