import Dispatcher from "./core/Dispatcher";

import WorkspaceModule      from "./modules/WorkspaceModule";

/**
 * Модуль "Редактор блоков" административного интерфейса web-приложения "Макетная плата"
 *
 * Задаёт взаимосвязи между событиями и функциями модулей.
 * Запускается в браузере администратора приложения.
 */
class AdminBlocklyApplication {
    constructor() {
        /// Диспетчер событий
        this._dispatcher = new Dispatcher();
        /// Конфигурация
        this._config = {};

        this._container_id = undefined;
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
     * Инициализируются модули, производится
     */
    run(types=false) {
        this._initModules(types);
        this._subscribeToModules();

        this._dispatcher.always(['ws:*']);
    }

    getBlockLimit() {
        return this.ws.getBlockLimit();
    }

    getHandlers() {
        return this.ws.getAllHandlers();
    }

    getCodeXml() {
        return this.ws.getTree();
    }

    setCodeXml(code_xml) {
        this.ws.loadTree(code_xml);
    }

    onChange(callback) {
        this._on_change_callback = callback;
    }

    resize() {
        this.ws.resize();
    }

    getBlockTypeLimits() {
        return this.ws.getBlockLimitInputsByType();
    }
    
    setBlockTypeLimits(block_type_limits) {
        this.ws.setBlockLimitInputsByType(block_type_limits);
    }

    /**
     * Инициализировать модули
     *
     * Используется заданная ранее конфигурация модулей
     *
     * @private
     */
    _initModules(types=false) {
        /// Модули
        this.ws = new WorkspaceModule(this._config.ws); // Blockly

        this.ws.wakeUp();

        if (types) {
            this.ws.generateExtraFields(true);
        }
    }

    _subscribeToModules() {
        this._dispatcher.subscribe(this.ws);
    }

    _defineChains() {
        $(document).ready(() => {
            this.ws.inject(document.getElementById(this._container_id));
        });

        this._dispatcher.on("ws:change", () => {
            this._on_change_callback();
        })
    }
}

window.AdminBlocklyApplication = AdminBlocklyApplication;

export default AdminBlocklyApplication;
