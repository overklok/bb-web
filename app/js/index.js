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

        this._config = {
            gui: {

            },
            lay: {

            },
            ws: {
                allBlocks: config.allBlocks
            },
            bb: {

            },
            gs: {
                csrfRequired: config.isInternal,
                modeDummy:  config.offline
            },
            ls: {
                modeDummy: config.isolated
            },
            log: {
                modeDummy: config.noRemoteLogs
            }
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

        this._dispatcher.only(['ls:connect']);
        this._dispatcher.always(['ls:*', 'ws:*', '*:error', 'lay:*', 'log:*', 'ls:disconnect']);
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
        this.log    = new LogModule(this._config.log);                      // логирование
        this.gui    = new GUIModule(this._config.gui);
        this.lay    = new LayoutModule(this._config.lay);
        this.ws     = new WorkspaceModule(this._config.ws);                 // Blockly
        this.bb     = new BreadboardModule(this._config.bb);                // макетная плата - графика
        this.ins    = new InstructorModule(this._config.ins);               // дед
        this.ls     = new LocalServiceModule(this._config.ls);              // макетная плата - electron
        this.gs     = new GlobalServiceModule(this._config.gs);             // веб-сервер
    }

    _subscribeToModules() {
        this._dispatcher.subscribe(this.log);
        this._dispatcher.subscribe(this.gui);
        this._dispatcher.subscribe(this.lay);
        this._dispatcher.subscribe(this.ws);
        this._dispatcher.subscribe(this.ins);
        this._dispatcher.subscribe(this.ls);
        this._dispatcher.subscribe(this.gs);
    }

    _defineChains() {
        /**
         * Когда плата готова к работе
         */
        this._dispatcher.on('ls:connect', () => {
            /// Запросить ссылки для прошивки
            this.gs.getUpgradeURLs()
                /// Обновить прошивку
                .then(urls  => this.ls.firmwareUpgrade(urls))
                /// Разрешить обрабатывать события платы и GUI
                .then(()    => this._dispatcher.only(['ls:*', 'gui:*']))
        });

        this._dispatcher.on('ls:command', (data) => {
            console.log(data);
            this.ws.highlightBlock(data.block_id);
        });

        /**
         * Когда разметка скомпонована
         */
        this._dispatcher.on('lay:compose', (data) => {
            this.ws.include(data.editor);
            this.bb.inject(data.board);

            /// Прослушивать все события GUI
            this._dispatcher.only(['gui:*']);
        });

        this._dispatcher.on('gui:launch', () => {
            let handlers = this.ws.getHandlers();
            console.log(handler);
            this.ls.updateHandlers(code.main);
            // this._dispatcher.only(['gui:stop', 'ls:command']);
        });

        /**
         * Когда нажата кнопка переключения разметки
         */
        this._dispatcher.on('gui:switch', on => {
            this._dispatcher.taboo();

            this.ws.exclude();
            this.bb.takeout();


            if (on === true) {
                this.lay.compose("default");
            }

            if (on === false) {
                this.lay.compose("debug");
            }
        });

        this._dispatcher.on('gui:unload-tree', () => {
            let tree = this.ws.getTree();
            this.gui.saveToFile(tree);
        });

        this._dispatcher.on('gui:load-tree', tree => {
            this.ws.loadTree(tree);
        });

        this._dispatcher.on('gui:check', () => {
            let handlers = this.ws.getHandlers();
            this.gs.commitHandlers(handlers)
                .then(response => {console.log(response)})
        });

        this._dispatcher.on('ws:change', handlers => {
            this.ls.updateHandlers(handlers);
            // console.log("WS HDLR", handlers);
        });

        this._dispatcher.on('log:tick', () => {
            this._dispatcher.dumpLogs(true)
                .then(logs      => this.log.collectLogs(logs))
                .then(log_bunch => this.gs.reportLogBunch(log_bunch))
                .then(()        => this.log.runTicker())
        });

        /**
         * Когда размер разметки изменён
         */
        this._dispatcher.on('lay:resize', () => {
            this.ws.resize();
        });

        /**
         * Ошибки локального сервиса
         */
        this._dispatcher.on('ls:error', (err) => {
            console.error('[LSERR]', err);
        });

        /**
         * Ошибки глобального сервиса
         */
        this._dispatcher.on('gs:error', (err) => {
            console.error('[GSERR]', err);
        });
    }
}

window.Application = Application;

export default Application;
