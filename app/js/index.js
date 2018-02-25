import Dispatcher from "./core/Dispatcher";

import LogModule            from "./modules/LogModule";
import GUIModule            from "./modules/GUIModule";
import TracingModule        from "./modules/TracingModule";
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
            ins: {
                lessonID: config.lessonID
            },
            trc: {

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
        this._dispatcher.always(['ins:start', '*:resize', 'ls:*', '*:error', 'lay:*', 'log:*']);
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
        this.trc    = new TracingModule(this._config.trc);                  // многофункциональная область
        this.lay    = new LayoutModule(this._config.lay);
        this.ws     = new WorkspaceModule(this._config.ws);                 // Blockly
        this.bb     = new BreadboardModule(this._config.bb);                // макетная плата - графика
        this.ins    = new InstructorModule(this._config.ins);               // дед
        this.ls     = new LocalServiceModule(this._config.ls);              // макетная плата - electron
        this.gs     = new GlobalServiceModule(this._config.gs);             // веб-сервер

        // this.gui.setButtonCodes([81, 87, 69, 38, 40, 37, 39]);



        // this.lay.compose("full")
        //     .then(() => this.gui.hideSpinner());

        // this.ins.setValidButtonSequence([81, 87, 69]);

        // this.trc.registerVariables([
        //     {name: "strip_index", initial_value: 1, type: "string"},
        //     {name: "strip_colour", initial_value: "000000", type: "colour"},
        //     {name: "strip_brightness", initial_value: 0, type: "number"},
        // ]);
    }

    /**
     * Подписать диспетчер на события модулей
     *
     * @private
     */
    _subscribeToModules() {
        this._dispatcher.subscribe(this.log);
        this._dispatcher.subscribe(this.gui);
        this._dispatcher.subscribe(this.ins);
        this._dispatcher.subscribe(this.lay);
        this._dispatcher.subscribe(this.ws);
        this._dispatcher.subscribe(this.ls);
        this._dispatcher.subscribe(this.gs);

        this._dispatcher.ready();
    }

    /**
     * Определить цепочки-обработчики
     *
     * @private
     */
    _defineChains() {
        this._dispatcher.onReady(() => {
            this.ins.getInitialLessonID()
            .then(lesson_id => this.gs.getLessonData(lesson_id))
            .then(lesson_data => this.ins.launchLesson(lesson_data));
        });

        this._dispatcher.on('ins:start', (exer_data) => {
            this.lay.compose('simple')
                .then(() => this.gui.hideSpinner())
                .then(() => this._dispatcher.only(['gui:*']))
        });

        /**
         * Готовность платы к работе
         */
        this._dispatcher.on('ls:connect', () => {
            /// Запросить ссылки для прошивки
            // this.gs.getUpgradeURLs()
                /// Обновить прошивку
                // .then(urls  => this.ls.firmwareUpgrade(urls))
                /// Разрешить обрабатывать события платы и GUI
                // .then(()    => this._dispatcher.only(['ls:*', 'gui:*']))
        });

        /**
         * Выполнена команда
         */
        this._dispatcher.on('ls:command', data => {
            console.log(data);
            this.ws.highlightBlock(data.block_id);
        });

        /**
         * Изменено значение переменной
         */
        this._dispatcher.on('ls:variable', data => {
            console.log(data);
            this.trc.setVariableValue(data.id, data.value);
        });

        /**
         * Когда
         */
        this._dispatcher.on('ls:finish', () => {
            this.ws.highlightBlock(null);
        });

        /**
         * Начало компоновки разметки
         */
        this._dispatcher.on('lay:compose-begin', data => {
            this.ws.eject();
            this.bb.eject();
            this.trc.eject();
        });

        /**
         * Окончание компоновки разметки
         */
        this._dispatcher.on('lay:compose-end', data => {
            this.ws.inject(data.workspace),
            this.bb.inject(data.breadboard),
            this.trc.inject(data.tracing, data.buttons)
        });

        /**
         * Нажата кнопка "Запустить"
         */
        this._dispatcher.on('gui:launch-main', () => {
            let handler = this.ws.getMainHandler();

            this.ls.updateHandlers({commands: handler.commands, launch: true});

            console.log({commands: handler.commands, launch: true});

            // this._dispatcher.only(['gui:stop', 'ls:command']);
        });

        /**
         * Нажата кнопка "Остановить"
         */
        this._dispatcher.on('gui:stop', data => {
            this.ls.stopExecution();
            this.ws.highlightBlock(null);
        });

        /**
         * Нажата кнопка "Переключить разметку"
         */
        this._dispatcher.on('gui:switch', on => {
            this.lay.compose("simple")
                .then(() => this.lay.compose("full"))
                .then(() => this._dispatcher.only(["gui:*"]))
        });

        /**
         * Нажата кнопка "Выгрузить в файл"
         */
        this._dispatcher.on('gui:unload-file', () => {
            let tree = this.ws.getTree();
            this.gui.saveToFile(tree);
        });

        /**
         * Нажата кнопка "Загрузить из файла"
         */
        this._dispatcher.on('gui:load-file', tree => {
            this.ws.loadTree(tree);
        });

        /**
         * Нажата кнопка "Проверить"
         */
        this._dispatcher.on('gui:check', () => {
            this.ws.clearErrorBlocks();

            let handlers = this.ws.getAllHandlers();
            this.gs.commitHandlers({}, handlers)
                .then(verdict => {
                    this._dispatcher.only(['ins:*']);
                    return verdict;
                })
                .then(verdict => this.ins.applyVerdict(verdict));
        });

        /**
         * Нажата клавиша
         */
        this._dispatcher.on('gui:keyup', button_code => {
            /// найти первый обработчик нажатия клавиши
            let handler = this.ws.getButtonHandler(button_code);

            if (handler) {
                /// обновить код на плате
                this.ls.updateHandlers({commands: handler.code, launch: false});
            }

            /// проверить правильность нажатия клавиши
            let valid = this.ins.validateButtonPress(button_code);
            /// вывести нажатие клавиши
            this.trc.displayKeyboardPress(button_code, !valid);

            console.log('keyup', button_code);
        });

        /**
         * Задание пройдено
         */
        this._dispatcher.on('ins:pass', verdict => {
            alert(verdict.message);
            this._dispatcher.only(['gui:*']);
        });

        /**
         * Задание провалено
         */
        this._dispatcher.on('ins:fault', verdict => {
            alert(verdict.message);
            this.ws.highlightErrorBlocks(verdict.blocks);
            this._dispatcher.only(['gui:*']);
        });

        /**
         * Тик сборки логов
         */
        this._dispatcher.on('log:tick', () => {
            this._dispatcher.dumpLogs(true)
                .then(logs      => this.log.collectLogs(logs))
                .then(log_bunch => this.gs.reportLogBunch(log_bunch))
                .then(()        => this.log.runTicker())
        });

        /**
         * Размер разметки изменён
         */
        this._dispatcher.on('lay:resize', () => {
            this.ws.resize();
            this.trc.resize();
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
