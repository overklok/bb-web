import Module from '../core/Module';

import SocketWrapper from '../wrappers/SocketWrapper';
import ElectronIPCWrapper from '../wrappers/ElectronIPCWrapper';

/**
 * Модуль взаимодействия с локальным сервисом
 *
 * Работает в двух режимах:
 *      - Electron IPC (при запуске в среде Electron)
 *      - Socket.IO (при запуске в браузере)
 */
export default class LocalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "ls"}
    static get event_types()        {return [
        "connect", "disconnect", "command", "variable",
        "terminate", "plates", "currents", "board-status", "timeout", "error"
    ]};

    static defaults() {
        return {
            modeDummy: false,       // холостой режим
            connectTimeout: 5000,   // время в мс, через которое запустится проверка подключения сервиса
            portUrgent: false,
        }
    }

    constructor(options) {
        super(options);

        this._ipc = undefined;

        this._version = undefined;

        this._state = {
            connected: false,
            board_status: undefined,
        };

        /// если режим холостой
        if (this._options.modeDummy) {
            this._debug.log('Working in DUMMY mode');

            setTimeout(() => {
                this.emitEvent("connect");
                this.emitEvent("board-status", "connect");
            }, 1000);

        } else {
            if (this._options.portUrgent) {
                this.resetPort(this._options.portUrgent);
            }

            this._launchIPC();
            this._subscribeToWrapperEvents();
        }
    }

    getBoardStatus() {
        return this._state.board_status;
    }

    openMenu() {
        if (this._options.modeDummy) {
            return new Promise(resolve => resolve())
        }

        return new Promise(resolve => {
            this._ipc.send('menu');

            resolve();
        });
    }

    resetPort(port) {
        if (!port) throw new TypeError("Parameter `port` is not defined");

        if (this._options.modeDummy) {
            return new Promise(resolve => resolve())
        }

        return new Promise(resolve => {
            this.emitEvent("board-status", "search");
            this._ipc.send('reset-port', port);

            this._ipc.once('reset-port.result', (event, error) => {
                if (error) {
                    this.emitEvent("board-status", "disconnect");
                    this._debug.error(error);
                } else {
                    this._debug.info("Connected to", port);
                    this.emitEvent("board-status", "connect");

                    resolve();
                }
           });
        });
    }

    /**
     * Обновить код на плате
     *
     * @param {Object} handlers обработчики, формат:
     *                          {
     *                              commands: "<код обработчика>",
     *                              execute: "<флаг запуска>"
     *                           }
     *
     *                           Для главного обработчика ID = main, key = "None"
     */
    updateHandlers(handlers) {
        if (this._options.modeDummy) {
            this.emitEvent("terminate");
            return new Promise(resolve => resolve())
        }

        return new Promise(resolve => {
            this._ipc.send('code-update', handlers);

            this._ipc.once('code-update.result', (event, error) => {
                if (error) {
                   this._debug.error(error);
                   throw error;
                } else {
                   resolve();
                }
           });
        });
    }

    /**
     * Зарегистрировать нажатие клавиши
     *
     * @param button_code   код клавиши
     * @deprecated
     * @returns {boolean}   true, если модуль в холостом режиме
     */
    registerKeyUp(button_code) {
        if (this._options.modeDummy) {return true}

        this._ipc.send('keyup', button_code);
    }

    /**
     * Остановить выполнение программы
     *
     * @returns {boolean}   true, если модуль в холостом режиме
     */
    stopExecution() {
        if (this._options.modeDummy) {return true}

        this._ipc.send('stop');
    }

    /**
     * Обновить прошивку платы по указанной ссылке
     *
     * @param {Array} urls массив ссылок на файлы прошивки
     */
    firmwareUpgrade(urls) {
        if (this._options.modeDummy) {return new Promise(resolve => resolve())}

        return new Promise(resolve => {
            this._ipc.send('upgrade', urls);

            this._ipc.once('upgrade.result', (event, error) => {
                if (error) {
                    this._debug.error(error);
                    throw error;
                } else {
                    this._debug.info('Firmware upgraded successfully');
                    resolve();
                }
            });
        });
    }

    setMode(mode) {
        if (this._options.modeDummy) {return true}

        this._ipc.send('set-mode', mode);
    }

    /**
     * Запустить механизм межпроцессной коммуникации
     *
     * @private
     */
    _launchIPC() {
        if (this._options.modeDummy) {return true}

        if (window && window.process && window.process.type) {
            this._debug.log("Swtiching on IPCWrapper");
            this._ipc = new ElectronIPCWrapper();
        } else {
            this._debug.log("Swtiching on SocketWrapper");
            this._ipc = new SocketWrapper();
        }

        this._ipc.send('connect');

        this._checkConnection();
    }

    /**
     * Проверить установление соединения
     *
     * Проверка срабатывает через время, указанное в опциях модуля
     *
     * Результат проверки зависит от значения внутренней переменной состояния [[connected]]
     *
     * @private
     */
    _checkConnection() {
        if (!this._options.connectTimeout) {return}

        setTimeout(() => {
            if (this._state.connected === false) {
                this.emitEvent("timeout");
            }
        }, this._options.connectTimeout)
    }

    /**
     * @inheritDoc
     * @private
     */
    _subscribeToWrapperEvents() {
        /* Как только сервис сообщил о соединении */
        this._ipc.on('connect', (evt, version) => {
            this._state.connected = true;
            this.emitEvent('connect');
            console.log(version);
            this._debug.info(`Connected to IPC ver. ${version}`);
            this._version = version;
        });

        /* Как только сервис сообщил о разъединении */
        this._ipc.on('disconnect', () => {
            this.emitEvent('disconnect');
        });

        this._ipc.on('board-search', () => {
            this._state.board_status = 'search';
            this.emitEvent('board-status', 'search');
        });

        this._ipc.on('board-connect', () => {
            this._state.board_status = 'connect';
            this.emitEvent('board-status', 'connect');
        });

        this._ipc.on('board-disconnect', () => {
            this._state.board_status = 'disconnect';
            this.emitEvent('board-status', 'disconnect');
        });

        /* Как только сервис сообщил об исполнении команды */
        this._ipc.on('command', (evt, data) => {
            this.emitEvent('command', data);
        });

        this._ipc.on('var_change', (evt, data) => {
            this.emitEvent('variable', data);
        });

        /* Как только сервис сообщил о завершении исполнения кода */
        this._ipc.on('terminate', (evt) => {
            this.emitEvent('terminate');
        });

        this._ipc.on('draw_plates', (evt, data) => {
           this.emitEvent('plates', data);
        });

        this._ipc.on('draw_currents', (evt, data) => {
           this.emitEvent('currents', data);
        });

        /* Как только сервис сообщил об ошибке- */
        this._ipc.on('error', (evt, err) => {
            this._debug.error(err);
            // this.emitEvent('error', arg)
        });
    }
}