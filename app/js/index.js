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
                anyKey: config.anyKey
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

        console.log("INITIALIZED");
        this.lay.compose("full");

        setTimeout(() => {
            this.lay.compose("simple");
        }, 500);

        setTimeout(() => {
            this.lay.compose("full");
        }, 5500);
            // .then(() => console.log("FULL READY"))
            // .then(() => this.lay.compose("simple"))
            // .then(() => this.lay.compose("simple"))
            // .then(() => this.lay.compose("simple"))
            // .then(() => this.lay.compose("full"))
            // .then(() => this.lay.compose("full"))
            // .then(() => this.lay.compose("simple"))
            // .then(() => this.lay.compose("simple"))
            // .then(() => this.lay.compose("full"))
            // .then(() => console.log("SIMPLE READY"))
            // .then(() => this.lay.compose("full"))
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

        this.gui.setButtonCodes([81, 87, 69]);
    }

    _subscribeToModules() {
        this._dispatcher.subscribe(this.log);
        this._dispatcher.subscribe(this.gui);
        this._dispatcher.subscribe(this.lay);
        this._dispatcher.subscribe(this.ws);
        this._dispatcher.subscribe(this.ins);
        this._dispatcher.subscribe(this.ls);
        this._dispatcher.subscribe(this.gs);

        // this.lay.compose("simple")
        //     .then(() => this.lay.switchButtonsPane(true))
        //     .then(() => this.lay.switchButtonsPane(false))
        //     .then(() => this.lay.switchButtonsPane(true))
        //     .then(() => this.lay.compose("full"))
        //     .then(() => this.lay.switchButtonsPane(true))
        //     .then(() => this.lay.switchButtonsPane(false))
        //     .then(() => this.lay.switchButtonsPane(true))
        //     .then(() => this.lay.compose("simple"));
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

        this._dispatcher.on('ls:finish', () => {
            this.ws.highlightBlock(null);
        });

        /**
         * Когда разметка скомпонована
         */
        this._dispatcher.on('lay:compose-begin', data => {
            console.log("COMPOSE BEGIN", data);
            this.ws.eject(true, data.workspace);
            this.bb.eject(true, data.breadboard);


            /// Прослушивать все события GUI
            // this._dispatcher.only(['gui:*']);
        });

        this._dispatcher.on('lay:compose-end', data => {
           console.log("COMPOSE END", data);

            this.ws.inject(data.workspace);
            this.bb.inject(data.breadboard);
        });

        this._dispatcher.on('gui:launch', () => {
            let handlers = this.ws.getHandlers();
            let code = WorkspaceModule._preprocessCode(handlers.main);

            this.ls.updateHandlers({main: {commands: code, btn: "None"}});
            // this._dispatcher.only(['gui:stop', 'ls:command']);
        });

        this._dispatcher.on('gui:stop', data => {
            this.ls.stopExecution();
            this.ws.highlightBlock(null);
        });

        /**
         * Когда нажата кнопка переключения разметки
         */
        this._dispatcher.on('gui:switch', on => {
            this.ws.eject();
            this.bb.eject();


            if (on === true) {
                this.lay.compose("default");
            }

            if (on === false) {
                this.lay.compose("debug");
            }
        });

        this._dispatcher.on('gui:unload-file', () => {
            let tree = this.ws.getTree();
            this.gui.saveToFile(tree);
        });

        this._dispatcher.on('gui:load-file', tree => {
            this.ws.loadTree(tree);
        });

        this._dispatcher.on('gui:check', () => {
            let handlers = this.ws.getHandlers();
            this.gs.commitHandlers(handlers)
                .then(response => {console.log(response)})
        });

        this._dispatcher.on('gui:keyup', button_code => {
            this.ls.registerKeyUp(button_code);
            console.log('keyup', button_code);
        });

        this._dispatcher.on('ws:change', handlers => {
            // console.log(handlers);
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
