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
        "connect", "disconnect", "client_swap", "command", "variable",
        "terminate", "plates", "currents", "board-status", "timeout", "error"
    ]};

    static defaults() {
        return {
            modeDummy: false,       // холостой режим
            connectTimeout: 5000,   // время в мс, через которое запустится проверка подключения сервиса
            portUrgent: false,
            socketAddress: '127.0.0.1',
            socketPort: '8005'
        }
    }

    constructor(options) {
        super(options);

        this._ipc = undefined;

        this._version = undefined;

        this._state = {
            connected: false,
            board_status: undefined,
            check_later: false,
        };

        this.launch();
    }

    switchDummyMode(on) {
        super.switchDummyMode(on);

        this.launch();
    }

    launch() {
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
     * @param {boolean} check_later запускать ли проверку после завершения программы
     */
    updateHandlers(handlers, check_later=false) {
        this._state.check_later = check_later;

        if (this._options.modeDummy) {
            this.emitEvent("terminate", this._state.check_later);
            return new Promise(resolve => resolve())
        }

        if (handlers.commands.length === 0) {
            this.emitEvent("terminate", this._state.check_later);
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

    sendSpi(data) {
        if (!data) throw new TypeError("Parameter `data` is not defined");

        if (this._options.modeDummy) {
            return new Promise(resolve => resolve())
        }

        return new Promise(resolve => {
            this._ipc.send('spi-update', data);

            this._ipc.once('spi-update.result', (event, error) => {
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

    setIPC(ipc_alias, socket_addr, socket_port) {
        switch (ipc_alias) {
            case 'electron': {
                if (window && window.process && window.process.type) {
                    this._useIPCElectron();
                } else {
                    throw new Error('Cannot use Electron IPC');
                }
                break;
            }
            case 'socket': {
                this._useIPCSocket(socket_addr, socket_port);
                break;
            }
            default: {
                throw new RangeError('Unrecognized IPC alias');
            }
        }
    }

    /**
     * Запустить механизм межпроцессной коммуникации
     *
     * @private
     */
    _launchIPC() {
        if (this._options.modeDummy) {return true}

        if (window && window.process && window.process.type) {
            this._useIPCElectron();
        } else {
            this._useIPCSocket();
        }

        this._ipc.send('connect');

        this._checkConnection();
    }

    _useIPCElectron() {
        this._debug.log("Swtiching to IPCWrapper");
        this._ipc = new ElectronIPCWrapper();
    }

    _useIPCSocket(socket_addr, socket_port) {
        let saddr = socket_addr ? socket_addr : this._options.socketAddress,
            sport = socket_port ? socket_port : this._options.socketPort;

        this._debug.log("Swtiching to SocketWrapper", saddr, sport);
        this._ipc = new SocketWrapper(saddr, sport);
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
            if (!this._options.modeDummy && this._state.connected === false) {
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

        this._ipc.on('client_swap', () => {
            this.emitEvent('client_swap');
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
            this.emitEvent('terminate', this._state.check_later);
            this._state.check_later = false;
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