import Dispatcher from "./core/Dispatcher";

import LogModule            from "./modules/LogModule";
import GUIModule            from "./modules/GUIModule";
import LayoutModule         from "./modules/LayoutModule";
import BreadboardModule     from "./modules/BreadboardModule";
import WorkspaceModule      from "./modules/WorkspaceModule";
import InstructorModule     from './modules/InstructorModule';
import LocalServiceModule   from "./modules/LocalServiceModule";
import GlobalServiceModule  from "./modules/GlobalServiceModule";

class Application {
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
                useScrollbars: true
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
    run() {
        this._initModules();
        this._subscribeToModules();

        this._dispatcher.always(['ws:*']);
    }

    getHandlers() {
        return this.ws.getHandlers();
    }

    onChange(callback) {
        this._on_change_callback = callback;
    }

    /**
     * Инициализировать модули
     *
     * Используется заданная ранее конфигурация модулей
     *
     * @private
     */
    _initModules() {
        /// Модули
        this.ws = new WorkspaceModule(this._config.ws); // Blockly
    }

    _subscribeToModules() {
        this._dispatcher.subscribe(this.ws);
    }

    _defineChains() {
        $(document).ready(() => {
            this.ws.include(document.getElementById(this._container_id));
        });

        this._dispatcher.on("ws:change", () => {
            this._on_change_callback();
        })
    }
}

window.Application = Application;

export default Application;
