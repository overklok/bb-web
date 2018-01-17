/**
 * Диспетчер - менеджер суррогатных событий.
 * Каждое приложение обладает единственным диспетчером.
 * Диспетчер не знает о существовании приложения, но знает о модулях.
 *
 * Задача диспетчера - сообщить приложение с модулями, вызывая обработчики суррогатных событий в приложении
 * для обработки событий в модулях. В качестве обработчиков выступают цепочки обещаний.
 *
 * С помощью диспетчера можно управлять прослушиванием событий: включать или отключать подмножества типов событий
 * в различных ситуациях.
 */
class Dispatcher {
    constructor() {
        this._handlers = {};
        this._event_types_listening = {
            always: new Set(),
            current: new Set()
        };

        this._event_types = new Set();
    }

    /**
     * Подписать диспетчер на события модуля
     *
     * Тестируемое поведение:
     *     - Тип события добавляется в список прослушиваемых типов событий
     *     - Обработчики событий модуля будут вызывать метод, вызывающий локальный обработчик соответствующего
     *       суррогатного события
     *
     * События модуля будут обрабатываться подключёнными к нему обработчиками суррогатных событий
     * по имени "краткое_имя_модуля:имя_события" (см. метод [Dispatcher.on()])
     *
     * @param {Module} module экземпляр модуля, на события которого требуется подписка
     */
    subscribe(module) {
        let self = this;

        let event_types = module.event_types;
        let module_prefix = module.eventspace_name;

        event_types.forEach(function(name, index) {
            let full_name = module_prefix + ':' + name;

            module.attachEventListener(name, function (data) {
                let fn = self._getHandler(full_name);
                fn(data);
            });

            /// Добавить тип события в общий список
            self._event_types.add(full_name);
        });
    }

    /**
     * Установить обработчик суррогатного события
     *
     * События с именем name будут использовать функцию handler в качестве реакции
     *
     * Тестируемое поведение:
     *     - Выбрасывает исключения при неверных аргументах
     *     - Словарь обработчиков дополняется данным обработчиком с данным именем события
     *     - При вызове функции с тем же именем события, но с другим обработчиком происходит переопределение
     *
     * @param {string}      name        имя типа суррогатного события в формате "краткое_имя_модуля:имя_события"
     * @param {Function}    handler     функция-обработчик событий
     */
    on(name, handler) {
        if (typeof name     !== 'string')    {throw new TypeError('Name is not a string!')}
        if (typeof handler  !== 'function')  {throw new TypeError('Handler is not a function!')}

        this._handlers[name] = handler;
    }

    /**
     * Установить подмножество типов событий, которые будут обрабатываться всегда
     *
     * Тестируемое поведение:
     *     - Выбрасывает исключение, если аргумент не является массивом
     *     - Заданный массив преобразуется в развёрнутое подмножество событий, сохраняющееся в параметрах объекта
     *
     * Формат массива eventspace см. [getFilterByEventspace()]
     *
     * @param {Array<string>} eventspace подмножество событий
     */
    always(eventspace) {
        if (eventspace && !Array.isArray(eventspace))    {throw new TypeError ('Eventspace should be an array!')}

        // this._event_types_listening.always.clear();

        this._event_types_listening.always = new Set(
            [...this._event_types].filter(Dispatcher.getFilterByEventspace(eventspace))
        );
    }

    /**
     * Прослушивать все типы событий
     *
     * Тестируемое поведение
     *     - Функция должна заменить прослушиваемые типы событий на все возможные
     */
    all() {
        this._event_types_listening.current = this._event_types;
    }

    /**
     * Прослушивать только заданные типы событий
     *
     * @param eventspace
     */
    only(eventspace) {

    }

    /**
     * Прослушивать все типы событий, кроме заданных
     *
     * @param eventspace
     */
    aside(eventspace) {

    }

    /**
     * Возвратить функцию-обработчик суррогатного события типа name
     *
     * Тестируемое поведение:
     *     - Если событие включено в список прослушиваемых, возвращаемая функция вызывает его обработчик
     *     - Если события нет в списке прослушиваемых, возвращаемая функция выводит предупреждение
     *     - При неправильном типе аргумента возвращаемая функция выбрасывает исключение с сообщением об ошибке
     *
     * @param   {string}    name          тип суррогатного события
     * @returns {Function}  функция-обработчик события / функция, выбрасывающая исключение
     * @private
     */
    _getHandler(name) {
        if (typeof name !== "string")
            return function() {throw new TypeError("Dispatcher._getHandler(): Name is not a string!")};

        if (this._event_types_listening.always.has(name) || this._event_types_listening.current.has(name)) {
            if (name in this._handlers) {
                return this._handlers[name];
            } else {
                return function(data) {console.warn("Dispatcher._getHandler(): handler for ", name, " was not defined, data:", data)};
            }
        } else {
            return function(data) {console.warn("Dispatcher_getHandler(): Event listener was disabled for a while, data:", data);}
        }
    }

    /**
     * Возвратить фильтр по маскам типов событий
     *
     * Массив eventspace может содержать как имена типов событий в развёрнутом виде, так и в виде маски.
     *
     * Правила:
     *     - `module:event1`    означает тип события `event1` модуля `module`
     *     - `module:*`         означает все события модуля `module`
     *     - `*`                означает абсолютно все события
     *
     * Тестируемое поведение:
     *     - Возвращаемая функция должна оставлять в фильтрующемся массиве только те элементы,
     *       которые заданы с помощью строк, составленных по правилам, перечисленным выше,
     *       в заданном массиве масок
     *
     * @param eventspace        массив масок типов событий
     * @returns {Function}      фильтр для массивов (см. функцию [Array.filter()])
     */
    static getFilterByEventspace(eventspace) {
        return function(item) {
            if (eventspace.includes(item)) {
                return true;
            }

            for (let i = 0; i < eventspace.length; i++) {
                let is_wildcard = (eventspace[i] === '*');
                let module_name = Dispatcher._isWildcardAfterColon(eventspace[i]);

                if ((is_wildcard) || (module_name && (module_name === item.split(':')[0]))) {
                    return true;
                }
            }
        }
    }

    /**
     * Проверить, содержит ли маска символ '*' после двоеточия
     *
     * Если символ есть, функция возвращает подстроку перед двоеточием
     * Если символа нет, функция возвращает false
     *
     * @param   {string}            mask    исходная маска
     * @returns {boolean|string}    соответствует ли маска требованию / подстрока перед двоеточием
     * @private
     */
    static _isWildcardAfterColon(mask) {
        if (typeof name !== "string")
            throw new TypeError("Dispatcher._isWildcard(): mask in not a string");

        if (mask.split(':').length === 1) {
            return false;
        }

        if (mask.split(':')[1] === "*") {
            return mask.split(':')[0];
        }
    }
}

export default Dispatcher;