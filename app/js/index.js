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
import Blockly from "node-blockly/browser";

const BUTTON_CODES = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0-9
    81, 87, 69, 82, 84, 89,                 // QWERTY
    65, 83, 68, 70, 71, 72,                 // ASDFGH
    38, 40, 37, 39                          // arrows
];

/**
 * Пользовательский интерфейс клиентской стороны web-приложения "Макетная плата"
 *
 * Задаёт взаимосвязи между событиями и функциями модулей.
 * Запускается в браузере конечного пользователя.
 */
class Application {
    /**
     * Создать экземпляр приложения
     */
    constructor() {
        /** @type {Dispatcher} диспетчер событий */
        this._dispatcher = new Dispatcher();

        /** @type {Object} общая конфигурация */
        this._config = {};

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

        /** type {Object} конфигурации модулей */
        this._config = {
            gui: {
                anyKey: config.anyKey,
                logoText: config.logoText,
                imagesPath: config.imagesPath,
                devMode: config.showDebugInfo
            },
            lay: {

            },
            ins: {
                lessonID: config.lessonID,
                silent: config.noIntros,
            },
            trc: {

            },
            ws: {
                allBlocks: config.allBlocks,
            },
            bb: {

            },
            gs: {
                origin: config.origin,
                csrfRequired: config.isInternal,
                modeDummy:  config.offline
            },
            ls: {
                modeDummy: config.isolated,
                portUrgent: config.port,
                socketAddress: config.socketAddress,
                socketPort: config.socketPort,
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
     * Инициализируются модули, выполняется подписка диспетчера на них
     */
    run() {
        this._initModules();
        this._subscribeToModules();

        this._dispatcher.only(['ls:connect']);
        this._dispatcher.always([
            '*:resize', '*:error',
            'ins:start', 'ins:progress', 'ins:mission',
            'ls:*', 'lay:*', 'log:*',
            'gui:hash-command', 'gui:stop', 'gui:menu', 'gui:ready'
        ]);
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

        /** @type {LogModule} */
        this.log    = new LogModule(this._config.log);
        /** @type {GUIModule} модуль графического интерфейса */
        this.gui    = new GUIModule(this._config.gui);
        /** @type {TracingModule} модуль трассировки кода */
        this.trc    = new TracingModule(this._config.trc);
        /** @type {LayoutModule} модуль разметки страницы */
        this.lay    = new LayoutModule(this._config.lay);
        /** @type {WorkspaceModule} модуль рабочей области */
        this.ws     = new WorkspaceModule(this._config.ws);
        /** @type {BreadboardModule} модуль отображения макетной платы */
        this.bb     = new BreadboardModule(this._config.bb);
        /** @type {InstructorModule} модуль управления прогрессом и выдачи подсказок */
        this.ins    = new InstructorModule(this._config.ins);
        /** @type {LocalServiceModule} модуль локального сервиса */
        this.ls     = new LocalServiceModule(this._config.ls);
        /** @type {GlobalServiceModule} модуль глобального сервиса */
        this.gs     = new GlobalServiceModule(this._config.gs);

        this.gui.registerButtonCodes(BUTTON_CODES);
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
        /**
         * Готовность диспетчера к работе
         */
        this._dispatcher.onReady(() => {
            let exercise_idx, mission_idx;

            let command = this.gui._checkURLHashCommand();
            if (command.type === "goto") {
                exercise_idx = command.data.exerciseIDX;
                mission_idx = command.data.missionIDX;
            }

            this.ins.getInitialLessonID()
                .then(lesson_id => this.gs.getLessonData(lesson_id))
                .then(lesson_data => this.ins.loadLesson(lesson_data))
                .then(lesson => {
                    this.gui.showMissionButtons(lesson.missions);
                    this.gui.setCourseText(lesson.name)
                })
                .then(() => this.ins.launchLesson(mission_idx, exercise_idx))
                .catch(error => {
                    this.gui.showSpinnerError(error.message);
                    console.error(error);
                });
        });

        /**
         * Запущено упражнение
         */
        this._dispatcher.on('ins:start', exercise => {
            /// Заблокировать все события
            this._dispatcher.only([]);

            this.gui.setExerciseCurrent(exercise.exerciseIDX);

            /// Скомпоновать разметку, убрать спиннер и разблокировать события GUI
            this.lay.compose(exercise.layout_mode)
                .then(() => this.ls.setMode(exercise.board_mode))
                .then(() => this.ws.loadProgram(exercise.missionIDX, exercise.exerciseIDX))
                .then(() => this.ws.setMaxBlockLimit(exercise.max_blocks))
                .then(() => this.ws.setEditable(exercise.editable))
                .then(() => this.gui.setLaunchVariant(exercise.launch_variant))
                .then(() => this.gui.showTask(exercise.task_description))
                .then(() => this.ws.setBlockTypes(exercise.block_types))
                .then(() => this.trc.registerVariables(exercise.variables))
                .then(() => this.trc.clearHistoryBlocks())
                .then(() => this.lay.switchButtonsPane(exercise.display_buttons))
                .then(() => this.gui.hideSpinner())
                .then(() => this.ins.tourIntro(exercise.popovers))
                .then(() => this.trc.clearButtons())
                .then(() => this.gui.listenButtons(exercise.check_buttons))
                .then(() => this.ins.setButtonsModel(exercise.buttons_model))
                .then(() => {
                    if (exercise.check_buttons) {
                        this._dispatcher.only(['gui:*', 'ins:pass']);
                    } else {
                        this._dispatcher.only(['gui:*']);
                    }
                })
        });

        /**
         * Нажата кнопка "Задание №"
         */
        this._dispatcher.on('gui:mission', mission_idx => {
            this.ins.launchMission(mission_idx);
        });

        this._dispatcher.on('ins:mission', mission_idx => {
            this.gui.setMissionCurrent(mission_idx);
        });

        this._dispatcher.on('gui:ready', () => {
            // setTimeout(() => {
            //     let status = this.ls.getBoardStatus();
            //
            //     if (status) {
            //         this.gui.setBoardStatus(status);
            //     }
            // }, 5000);
        });

        /**
         * Нажата кнопка "Проверить"
         */
        this._dispatcher.on('gui:check', () => {
            /// прослушивать только события прохождения или провала
            this._dispatcher.only(["ins:pass", "ins:fault"]);

            /// определить ИД упражнения
            let exID = this.ins.getExerciseID();
            /// зажать кнопку
            this.gui.affirmLaunchButtonState('check', false);
            /// очистить ошибочные блоки
            this.ws.clearErrorBlocks();

            /// получить обработчики
            Promise.all([
                this.ws.getAllHandlers(),
                this.bb.getData()
            ])
                .then(results   => {return {handlers: results[0], board: results[1]}})
                .then(data      => this.gs.commitSolution(exID, data))
                .then(verdict   => this.ins.applyVerdict(verdict))
                .then(()        => this.gui.affirmLaunchButtonState('check', true))
                .then(()        => {
                    this.gui.affirmLaunchButtonState('check', true);
                    this._dispatcher.only(['gui:*', 'ins:*']);
                })
                .catch((err)    => {
                    console.error(err);
                    this.gui.affirmLaunchButtonState('check', true);
                    this._dispatcher.only(['gui:*', 'ins:*'])
                });
        });

        /**
         * Нажата кнопка "Запустить"
         */
        this._dispatcher.on('gui:run', () => {
            this._dispatcher.only(["gui:stop"]);

            this.gui.affirmLaunchButtonState('execute', false);

            let handler = this.ws.getMainHandler();
            this.ls.updateHandlers({commands: handler.commands, launch: true});
            console.log({commands: handler.commands, launch: true});
        });

        /**
         * Нажата кнопка "Остановить"
         */
        this._dispatcher.on('gui:stop', () => {
            this.ls.stopExecution();
            this.ws.highlightBlock(null);

            this.gui.affirmLaunchButtonState('execute', true);

            this._dispatcher.only(["gui:*"]);
        });

        /**
         * Нажата клавиша
         */
        this._dispatcher.on('gui:keyup', button_code => {
            /// найти первый обработчик нажатия клавиши
            let handler = this.ws.getButtonHandler(button_code);

            console.log(handler);

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
         * Введена хэш-команда
         */
        this._dispatcher.on('gui:hash-command', command => {
            switch (command.type) {
                case "goto": {
                    if (command.data.missionIDX === undefined)  {
                        this.ins.forceExercise(command.data.missionIDX, undefined);
                    }

                    else if (command.data.exerciseIDX === undefined) {
                        this.ins.forceExercise(undefined, command.data.exerciseIDX);
                    }

                    else {
                        this.ins.forceExercise(command.data.missionIDX, command.data.exerciseIDX);
                    }

                    break;
                }
                default: {
                    console.warn("Unrecognised hash command");
                }
            }
        });

        /**
         * Нажат пункт меню
         */
        this._dispatcher.on('gui:menu', (data) => {
            switch (data.name) {
                case 'courses': {
                    this.gs.goToLessonPage();
                    break;
                }
                case 'settings': {
                    this.ls.openMenu();
                    break;
                }
                case 'developer': {
                    if (data.state) {
                        this.gui.switchDeveloperMode(true);
                        this.lay.revealTopPane();
                    } else {
                        this.gui.switchDeveloperMode(false);
                        this.lay.concealTopPane();
                    }
                    break;
                }
                default: {
                    console.warn(`Unhandled menu option '${option}'`);
                    break;
                }
            }
        });

        /**
         * Задание пройдено
         */
        this._dispatcher.on('ins:pass', verdict => {
            this._dispatcher.only([]);
            this.ws.saveProgram(verdict.missionIDX, verdict.exerciseIDX);
            this.ws.saveProgram(verdict.missionIDX, verdict.exerciseIDX+1);
            this.ins.tourPass()
                .then(
                    onResolve => this.ins.launchExerciseNext(),
                    onReject => {
                        this.ins.launchExerciseNext(true);
                        this.gui.setMissionSkiddingOn(verdict.missionIDX);
                    }
                )
                .then(() => this._dispatcher.only(['gui:*', 'ins:pass']))
        });

        /**
         * Задание провалено
         */
        this._dispatcher.on('ins:fault', verdict => {
            console.log("fault", verdict);
            this._dispatcher.only([]);
            try {
                this.ws.highlightErrorBlocks(verdict.blocks);
                this.bb.highlightErrorPlates(verdict.blocks);
                this.bb.highlightRegion(verdict.region, true);
            } catch (err) {
                console.error(err);
            }

            this.ins.tourFault(verdict.message)
                .then(() => this._dispatcher.only(['gui:*']))
        });

        /**
         * Задание выполнено
         */
        this._dispatcher.on('ins:progress', mission => {
           this.gui.setMissionProgress(mission);
        });

        /**
         * Готовность платы к работе
         */
        this._dispatcher.on('ls:connect', () => {
            this.gui.setBoardStatus('none');
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
            // this.trc.addHistoryBlock(data.block_id, this.ws.workspace);
        });

        /**
         * Изменено значение переменной
         */
        this._dispatcher.on('ls:variable', data => {
            console.log(data);
            this.trc.setVariableValue(data.id, data.value);
        });

        /**
         * Когда программа завершится
         */
        this._dispatcher.on('ls:terminate', () => {
            let exercise = this.ins.getExerciseCurrent();

            this.ws.highlightBlock(null);
            this.gui.affirmLaunchButtonState('execute', true);

            if (exercise.check_buttons) {
                this._dispatcher.only(['gui:*', 'ins:pass']);
            } else {
                this._dispatcher.only(['gui:*']);
            }

            // if (!exercise.is_sandbox  && !exercise.listeners_only) {
            //     this._dispatcher.call("gui:check");
            // }
        });

        /**
         * Изменены плашки
         */
        this._dispatcher.on('ls:plates', data => {
            this.bb.clearCurrents();
            this.bb.updatePlates(data);
        });

        /**
         * Изменены токи
         */
        this._dispatcher.on('ls:currents', data => {
            this.bb.updateCurrents(data);
        });

        /**
         * Изменён статус платы
         */
        this._dispatcher.on('ls:board-status', status => {
            console.log("BOARD STATUS", status);
            this.gui.setBoardStatus(status);
        });

        /**
         * Достигнут тайм-аут соединения с IPC
         */
        this._dispatcher.on('ls:timeout', () => {
            this.gui.showAlert('no_ipc');
        });

        /**
         * МПК отсоединился
         */
        this._dispatcher.on('ls:disconnect', () => {
            console.log("IPC DISCONNECTED");
            this.gui.setBoardStatus('default');
            this.gui.showAlert('no_server');
        });

        /**
         * МПК сменил клиента
         */
        this._dispatcher.on('ls:client_swap', () => {
            console.log("IPC SWAPPED CLIENT");
            this.gui.showAlert('another_client');
            this._dispatcher.kill();
        });

        /**
         * Начало компоновки разметки
         */
        this._dispatcher.on('lay:compose-begin', data => {
            this.ws.eject();
            this.bb.eject();
            this.trc.ejectBlocks();
            this.trc.ejectButtons();
            this.gui.ejectTextPane();
        });

        /**
         * Окончание компоновки разметки
         */
        this._dispatcher.on('lay:compose-end', data => {
            if (data) {
                this.gui.injectLaunchButtons(data.launch_buttons);
                this.ws.inject(data.workspace);
                this.bb.inject(data.breadboard);
                this.trc.injectBlocks(data.tracing);
                this.trc.injectButtons(data.buttons);
                this.gui.injectTextPane(data.task);
                this.gui.injectLessonPane(data.lesson);
            }
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
    }
}

window.Application = Application;

export default Application;
