const ERROR_EVENT_NAME = 'error';

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
export default class Dispatcher {
    /**
     * Создать экземпляр диспетчера.
     */
    constructor() {
        /** @type {Array<Module>} экземпляры прослушиваемых модулей */
        this._modules = [];

        /** @type {boolean} готовность модуля генерировать события */
        this._handler_ready = undefined;

        /** @type {Object} обработчики событий */
        this._handlers = {};

        /**
         * @type {{always: Set, current: Set}} прослушиваемые типы событий: постоянные и текущие
         */
        this._event_types_listening = {
            always: new Set(),
            current: new Set()
        };

        /** @type {boolean} события заблокированы */
        this._denied = false;
        /** @type {Array<string>} искючения при блокировке */
        this._deny_excepts = [];
        /** @type {Set} все зарегистрированные типы событий */
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
     * по имени `краткое_имя_модуля:имя_события` (см. метод {@link on})
     *
     * Событие `краткое_имя_модуля:ERROR_EVENT_NAME` переданного модуля
     * автоматически заносится в список прослушиваемых
     *
     * @param {Module} module экземпляр модуля, на события которого требуется подписка
     */
    subscribe(module) {
        let self = this;

        let event_types = module.event_types;
        let module_prefix = module.eventspace_name;

        event_types.forEach((name, index) => {
            let full_name = module_prefix + ':' + name;

            module.attachEventListener(name, (data) => {
                let fn = this._getHandler(full_name);
                fn(data);
            });

            /// Добавить тип события в общий список
            this._event_types.add(full_name);
        });

        this._modules.push(module);
    }

    /**
     * Сообщить о готовности модуля вручную
     *
     * @param {Object} data данные, передаваемые обраотчику события `ready`
     */
    ready(data) {
        if (this._handler_ready) {
            this._handler_ready(data);
        }
    }

    /**
     * Установить обработчик события готовности модуля
     *
     * @param {function} handler обработчик события готовности модуля
     */
    onReady(handler) {
        this._handler_ready = handler;
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
     * @param {string}      name        имя типа суррогатного события в формате `краткое_имя_модуля:имя_события`
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
     * Формат массива eventspace см. {@link getFilterByEventspace}
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
     * @param eventspace {string} имя пространства событий
     */
    only(eventspace) {
        return new Promise(resolve => {
            if (eventspace && !Array.isArray(eventspace))    {throw new TypeError ('Eventspace should be an array!')}

            this._event_types_listening.current.clear();

            this._event_types_listening.current = new Set(
                [...this._event_types].filter(Dispatcher.getFilterByEventspace(eventspace))
            );

            resolve();
        });
    }

    /**
     * Прослушивать все типы событий, кроме заданных
     *
     * TODO
     * @param eventspace {string} имя пространства событий
     */
    aside(eventspace) {

    }

    /**
     * TODO: tests
     *
     * @deprecated
     */
    allowAll() {
        this._denied = false;

        this._deny_excepts = new Set();
    }

    /**
     * Запрет на прослушивание любого типа событий
     *
     * TODO: tests
     *
     * @deprecated
     */
    denyAll(eventspace_excepts) {
        this._deny_excepts = new Set(
            [...this._event_types].filter(Dispatcher.getFilterByEventspace(eventspace_excepts))
        );

        this._denied = true;
    }

    kill() {
        this._event_types_listening = {
            always: new Set(),
            current: new Set()
        };

        console.info("Dispatcher was permanently killed.");
    }

    /**
     * Выгрузить отладочные записи всех модулей в единый JSON-объект
     *
     * @param {boolean} flush очищать буфер после выгрузки
     */
    dumpLogs(flush) {
        return new Promise(resolve => {
           let logs = [];

            for (module of this._modules) {
                logs.push(module.getDebugBuffer(flush));
            }

            resolve(logs);
        });
    }

    /**
     * Вызвать событие вручную
     *
     * @param {string} name название события
     * @param {Object} data данные события
     */
    call(name, data) {
        this._getHandler(name)(data);
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
     *
     * @returns {function}  функция-обработчик события / функция, выбрасывающая исключение
     * @private
     */
    _getHandler(name) {
        if (typeof name !== "string")
            return function() {throw new TypeError("Dispatcher._getHandler(): Name is not a string!")};

        let allow = false;

        if (this._denied) {
            /// если включён запрет
            if (this._deny_excepts.has(name)) {
                /// если есть исключения
                allow = true;
            }
        } else {
            /// если выключен запрет
            if (this._event_types_listening.always.has(name) || this._event_types_listening.current.has(name)) {
                allow = true;
            }
        }

        if (allow) {
            if (name in this._handlers) {
                return this._handlers[name];
            } else {
                return function(data) {console.debug("Dispatcher._getHandler(): handler for ", name, " was not defined, data:", data)};
            }
        } else {
            return function(data) {console.debug("Dispatcher_getHandler(): Event listener ", name , "was disabled for a while, data:", data);}
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
     *
     * @returns {function}      фильтр для массивов (см. функцию Array.filter())
     */
    static getFilterByEventspace(eventspace) {
        return function(item) {
            /// Если пространство событий содержит фильтрующий элемент
            if (eventspace.includes(item)) {
                return true;
            }

            /// Для всех элементов из заданного массива
            for (let i = 0; i < eventspace.length; i++) {
                /// Является ли групповым символом
                let is_wildcard = (eventspace[i] === '*');
                /// Имя модуля, если групповой символ стоит после двоеточия
                let module_name = Dispatcher._isWildcardAfterColon(eventspace[i]);
                /// Имя события, если групповой символ стоит до двоеточия
                let event_name  = Dispatcher._isWildcardBeforeColon(eventspace[i]);

                /// Если является групповым символом
                if ((is_wildcard)) {
                    return true;
                }

                /// Если групповой символ стоит после двоеточия и совпадает с именем модуля фильтрующего элемента
                if ((module_name && (module_name === item.split(':')[0]))) {
                    return true;
                }

                /// Если групповой символ стоит до двоеточия и совпадает с именем события фильтрующего элемента
                if ((event_name && (event_name === item.split(':')[1]))) {
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
     *
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

    /**
     * Проверить, содержит ли маска символ '*' перед двоеточием
     *
     * Если символ есть, функция возвращает подстроку после двоеточия
     * Если символа нет, функция возвращает false
     *
     * @param   {string}            mask    исходная маска
     *
     * @returns {boolean|string}    соответствует ли маска требованию / подстрока после двоеточия
     * @private
     */
    static _isWildcardBeforeColon(mask) {
        if (typeof name !== "string")
            throw new TypeError("Dispatcher._isWildcard(): mask in not a string");

        if (mask.split(':').length === 1) {
            return false;
        }

        if (mask.split(':')[0] === "*") {
            return mask.split(':')[1];
        }
    }
}