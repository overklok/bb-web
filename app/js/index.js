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
                devMode: config.showDebugInfo,
                testMode: config.testMode,
                emphasize: config.isStrip,
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
                zoomInitial: config.zoomBlocks,
            },
            bb: {
                modeAdmin: config.isAdmin,
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
            'gui:hash-command', 'gui:stop', 'gui:menu', 'gui:ready', 'gui:reconnect',
            'bb:change', 'bb:drag-start'
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
        this._dispatcher.subscribe(this.bb);

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
            if (command.type === "demo") {
                this.ls.switchDummyMode(true);
            }
            if (command.type === "full" && command.data) {
                this.ls.launch(command.data.address, command.data.port);
            }

            this.ins.getInitialLessonID()
                .then(lesson_id => this.gs.getLessonData(lesson_id))
                .then(lesson_data => this.ins.loadLesson(lesson_data))
                .then(lesson => {
                    this.gui.showMissionButtons(lesson.missions);
                    this.gui.setLessonText(lesson.name)
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
                .then(() => this.gui.setLaunchButtonVariant(exercise.launch_variant, exercise.is_sandbox))
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

        this._dispatcher.on('gui:exercise', exercise_id => {
            this.gs.goToExerciseAdminPage(exercise_id);
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

            this._gui_check()
                .then(() => {
                    this.gui.affirmLaunchButtonStarted('check', false);
                    this._dispatcher.only(['gui:*', 'ins:*']);
                })
                .catch((err) => {
                    console.error(err);
                    this.gui.affirmLaunchButtonStarted('check', false);
                    this._dispatcher.only(['gui:*', 'ins:*'])
                });
        });

        /**
         * Нажата кнопка "Запустить"
         */
        this._dispatcher.on('gui:run', check_later => {
            this._dispatcher.only(["gui:stop"]);

            if (check_later) {
                this.gui.affirmLaunchButtonStarted('chexec', true);
            } else {
                this.gui.affirmLaunchButtonStarted('execute', true);
            }

            let handler = this.ws.getMainHandler();
            this.ls.updateHandlers({commands: handler.commands, launch: true}, check_later);
            console.log({commands: handler.commands, launch: true});
        });

        /**
         * Нажата кнопка "Остановить"
         */
        this._dispatcher.on('gui:stop', check_later => {
            this.ls.stopExecution(true);
            this.ws.highlightBlock(null);

            if (check_later) {
                this.gui.affirmLaunchButtonStarted('chexec', false);
            } else {
                this.gui.affirmLaunchButtonStarted('chexec', false);
                this.gui.affirmLaunchButtonStarted('execute', false);
            }

            this._dispatcher.only(["gui:*"]);
        });

        this._dispatcher.on('gui:calc', extra => {
            this._dispatcher.only([]);

            this.gui.affirmLaunchButtonStarted('calc', true);

            let plates = this.bb.getData();

            // this.bb.clearCurrents();

            this.gs.calcCurrents(plates, extra)
                .then(results => Promise.all([
                    this.bb.updateCurrents(results),
                    this.ls.sendSpi(results.board_data)
                ]))
                .then(() => this.gui.affirmLaunchButtonStarted('calc', false))
                .catch(err => {
                    this.gui.affirmLaunchButtonStarted('calc', false);
                });

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
        });

        this._dispatcher.on('gui:reconnect', confirmed => {
            if (confirmed) {
                this.ls.switchDummyMode(false);
            } else {
                this.ls.switchDummyMode(true);
            }
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
                case "demo": {
                    this.ls.switchDummyMode(true);
                    this.gui.hideAllAlerts();

                    break;
                }
                case "full": {
                    this.ls.switchDummyMode(false);
                    if (command.data) {
                        this.ls.launch(command.data.address, command.data.port);
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
                case 'lessons': {
                    this._dispatcher.only([]);
                    // this.gs.goToLessonPage();
                    this.gui.switchMenu(2);
                    this.gui.switchDeveloperMode(false);
                    this.lay.compose('home')
                        .then(() => this._dispatcher.only(['gui:*']));
                    this.gs.getCoursesData()
                        .then(courses => {
                            this.gui.displayCourses(courses);
                        });

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
                case 'currents': {
                    this.gs.calcCurrents()
                        .then((currents) => this.bb.updateCurrents(currents));

                    break;
                }
                default: {
                    console.warn(`Unhandled menu option '${option}'`);
                    break;
                }
            }
        });

        this._dispatcher.on('gui:return', () => {
            this._dispatcher.only([]);

            this.gui.switchMenu(false);
            this.gui.switchDeveloperMode(true);

            let exercise = this.ins.getExerciseCurrent();
            this.lay.compose(exercise.layout_mode)
                .then(() => {
                    if (exercise.check_buttons) {
                        this._dispatcher.only(['gui:*', 'ins:pass']);
                    } else {
                        this._dispatcher.only(['gui:*']);
                    }
                });
        });

        this._dispatcher.on('gui:lesson', lesson_id => {
            this.gs.getLessonData(lesson_id)
                .then(lesson_data => this.ins.loadLesson(lesson_data))
                .then(lesson => {
                    this.gui.showMissionButtons(lesson.missions);
                    this.gui.setLessonText(lesson.name)
                })
                .then(() => this.ins.launchLesson())
                .then(() => {
                    this.gui.switchMenu(false);
                    this.ws.flushPrograms();
                })

        });

        /**
         * Задание пройдено
         */
        this._dispatcher.on('ins:pass', verdict => {
            this._dispatcher.only([]);
            this.ws.saveProgram(verdict.missionIDX, verdict.exerciseIDX);
            this.ws.saveProgram(verdict.missionIDX, verdict.exerciseIDX+1);
            this.ins.tourPass(verdict.skip)
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
            let exercise = this.ins.getExerciseCurrent();

            console.log("fault", verdict);
            this._dispatcher.only([]);
            try {
                if (exercise.board_mode === "programming") {
                    this.ws.highlightErrorBlocks(verdict.blocks);
                }

                if (exercise.board_mode === "electronics") {
                    this.bb.highlightErrorPlates(verdict.blocks);
                }
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
        this._dispatcher.on('ls:connect', data => {
            this.gui.setBoardStatus('none');
            this.gui.hideAllAlerts();

            if (data && data.is_socket) {
                this.gui.emphasize(data.is_socket);
            }

            if (data && data.dev_type === 3) {
                this.bb.switchSpareFilters(true);
            } else {
                this.bb.switchSpareFilters(false);
            }

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
        this._dispatcher.on('ls:terminate', check_needed => {
            let exercise = this.ins.getExerciseCurrent();

            this.ws.highlightBlock(null);
            this.gui.affirmLaunchButtonStarted('execute', false);

            if (exercise.check_buttons) {
                this._dispatcher.only(['gui:*', 'ins:pass']);
            } else {
                this._dispatcher.only(['gui:*', 'ins:*']);
            }

            if (check_needed) {
                this._dispatcher.only(['ins:*']);

                this._gui_check()
                    .then(() => {
                        this.gui.affirmLaunchButtonStarted('chexec', false);
                        this._dispatcher.only(['gui:*', 'ins:*']);
                    })
                    .catch((err) => {
                        console.error(err);
                        this.gui.affirmLaunchButtonStarted('chexec', false);
                        this._dispatcher.only(['gui:*', 'ins:*'])
                    });
            }
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
            this.gui.setBoardStatus(status);
        });

        // this._dispatcher.on('ls:request_calc', step => {
        //     let plates = this.bb.getData();
        //
        //     this.gs.calcCurrents(plates, step)
        //         .then(results => Promise.all([
        //             this.bb.updateCurrents(results),
        //             this.ls.sendSpi(results.board_data)
        //         ]))
        // });

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

            this.gui.showAlert("no_server");
        });

        /**
         * МПК сменил клиента
         */
        this._dispatcher.on('ls:client_swap', () => {
            console.log("IPC SWAPPED CLIENT");
            this.ls.switchDummyMode(true);
            this.gui.showAlertReconnect();

            // this._dispatcher.kill();
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
            this.gui.ejectLaunchButtons();
            this.gui.ejectHomeMenu();
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
                this.gui.injectHomeMenu(data.course);
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

        this._dispatcher.on('bb:change', () => {
            this.bb.clearCurrents();
        });

        this._dispatcher.on('bb:drag-start', () => {
            this.bb.clearCurrents();
            this.bb.clearRegions();
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

    _gui_check() {
        /// определить ИД упражнения
        let exercise = this.ins.getExerciseCurrent();
        /// зажать кнопку
        this.gui.affirmLaunchButtonStarted('check', true);
        /// очистить ошибочные блоки
        this.ws.clearErrorBlocks();

        if (exercise.is_sandbox) {
             this.ins.applyVerdict({
                 missionIDX: exercise.missionIDX,
                 exerciseIDX: exercise.idx,
                 skip: true,
             });

             this.gui.affirmLaunchButtonStarted('check', false);

             return new Promise(resolve => {resolve()});
        }

        /// получить обработчики
        let chain = Promise.all([
            this.ws.getAllHandlers(),
            this.bb.getData()
        ])
            .then(results   => {return {handlers: results[0], board: results[1]}})
            .then(data      => this.gs.commitSolution(exercise.pk, data))
            .then(verdict   => this.ins.applyVerdict(verdict))
            .then(()        => this.gui.affirmLaunchButtonStarted('check', false));

        return chain;
    }
}

window.Application = Application;

export default Application;
