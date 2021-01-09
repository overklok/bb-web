import Dispatcher from "./core/Dispatcher";

import WorkspaceModule      from "./modules/WorkspaceModule";

/**
 * Модуль "Редактор блоков" административного интерфейса web-приложения "Макетная плата"
 *
 * Задаёт взаимосвязи между событиями и функциями модулей.
 * Запускается в браузере администратора приложения.
 */
class AdminBlocklyApplication {
    /**
     * Создать экземпляр приложения
     */
    constructor() {
        /** @type {Dispatcher} диспетчер событий */
        this._dispatcher = new Dispatcher();

        /** @type {Object} общая конфигурация */
        this._config = {};

        /** @type {string} ID DOM-узла */
        this._container_id = undefined;

        /** @type {function} Обработчик события `изменены данные` */
        this._on_change_callback = function() {};

        this._defineChains();
    }

    /**
     * Преобразовать пользовательскую конфигурацию в настройки модулей
     *
     * Конфигурация, удобная для пользователя, преобразуется
     * в конфигурацию, требуемую в отдельных модулях
     *
     * @param {Object} config пользовательская конфигурация
     */
    configure(config) {
        if (!config) {return true}

        this._container_id = config.containerId || "";

        this._config = {
            ws: {
                allBlocks: config.allBlocks,
                useScrollbars: true,
                zoomInitial: config.workspaceZoomInitial,
            },
        };

        for (let conf_item in this._config) {
            this._config[conf_item].logging = {
                local: config.noRemoteLogs
            }
        }
    }

    /**
     * Запустить приложение
     *
     * Инициализируются модули, выполняется подписка диспетчера на них
     *
     * @param {boolean} [types=false] генерировать дополнительные поля в блоках
     */
    run(types=false) {
        this._initModules(types);
        this._subscribeToModules();

        this._dispatcher.always(['ws:*']);
    }

    /**
     * Получить необходимое для сборки набранного кода количество блоков
     *
     * @returns {number} необходимое количество блоков
     */
    getBlockLimit() {
        return this.ws.getBlockLimit();
    }

    /**
     * Получить отображаемые в данный момент коды
     *
     * Формат возвращаемого объекта:
     *      - ключ: `main`/ ID блока-обработчика
     *      - значение: {commands:Array, button:number}, где `commands` - JSON-код программы, `button` - код клавиши
     *
     * @returns {Object} основной код и коды обработчиков
     */
    getHandlers() {
        return this.ws.getAllHandlers();
    }

    /**
     * Получить XML-дерево набранного кода
     *
     * @returns {string} строка с XML-деревом
     */
    getCodeXml() {
        return this.ws.getTree();
    }

    /**
     * Отобразить програмный код в виде XML-дерева
     *
     * @param {string} code_xml XML-дерево, задающее программный код
     */
    setCodeXml(code_xml) {
        this.ws.loadTree(code_xml);
    }

    /**
     * Задать обработчик события `изменены данные`
     *
     * @param {function|null} callback обработчик события `изменены данные`
     */
    onChange(callback) {
        this._on_change_callback = callback;
    }

    /**
     * Подогнать размер редактора под размер DOM-контейнера
     */
    resize() {
        this.ws.resize();
    }

    /**
     * Получить значения полей ввода пределов количества блоков по типам
     *
     * Формат возвращаемого объекта:
     *      - ключ:     {string} тип блока
     *      - значение: {number} предел количества блоков по типу
     *
     * @returns {Object} значения полей ввода пределов количества блоков по типам
     */
    getBlockTypeLimits() {
        return this.ws.getBlockLimitInputsByType();
    }

    /**
     * Задать значения полей ввода пределов количества блоков по типам
     *
     * @param {Object} block_counts объект, в котором:
     *      - ключ:     {string} тип блока
     *      - значение: {number} предел количества блоков по типу
     */
    setBlockTypeLimits(block_type_limits) {
        this.ws.setBlockLimitInputsByType(block_type_limits);
    }

    /**
     * Инициализировать модули
     *
     * Используется заданная ранее конфигурация модулей
     *
     * @param {boolean} [types=false] генерировать дополнительные поля в блоках
     *
     * @private
     */
    _initModules(types=false) {
        /// Модули

        /** @type {WorkspaceModule} модуль рабочей области */
        this.ws = new WorkspaceModule(this._config.ws);

        this.ws.wakeUp();

        if (types) {
            this.ws.generateExtraFields(true);
        }
    }

    /**
     * Подписать диспетчер на события модулей
     *
     * @private
     */
    _subscribeToModules() {
        this._dispatcher.subscribe(this.ws);
    }

    /**
     * Определить цепочки-обработчики
     *
     * @private
     */
    _defineChains() {
        $(document).ready();

        this._dispatcher.on("ws:change", () => {
            if (typeof this._on_change_callback === 'function') {
                this._on_change_callback();
            }
        })
    }
}

window.AdminBlocklyApplication = AdminBlocklyApplication;

export default AdminBlocklyApplication;
