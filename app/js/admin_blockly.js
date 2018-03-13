import Dispatcher from "./core/Dispatcher";

import WorkspaceModule      from "./modules/WorkspaceModule";

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
     * @param config пользовательская конфигурация
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

    getBlockCount() {
        return this.ws.getBlockCount();
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

    getBlockCounts() {
        return this.ws.getBlockCountByType();
    }
    
    setBlockCounts(block_counts) {
        this.ws.setBlockCountByType(block_counts);
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
