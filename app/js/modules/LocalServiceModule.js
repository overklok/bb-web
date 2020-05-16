import Module from '../core/Module';

import SocketIPCWrapper from '../wrappers/ipc/SocketIPCWrapper';
import ElectronIPCWrapper from '../wrappers/ipc/ElectronIPCWrapper';
import QtIPCWrapper from "../wrappers/ipc/QtIPCWrapper";

const DEVICE_TYPES = {
    UNKNOWN: 0,
    "board": 1,
    "strip": 2,
    "board-rpi": 3,
};

/**
 * Модуль взаимодействия с локальным сервисом
 *
 * Работает в трёх режимах:
 *      - Electron IPC (при запуске в среде Electron)
 *      - Qt Web Channel (при запуске в Qt-приложении)
 *      - Socket.IO (при запуске в браузере)
 */
export default class LocalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "ls"}
    static get event_types()        {return [
        "connect", "disconnect", "client_swap", "command", "variable",
        "terminate", "plates", "currents", "pins_values", "board-status", "timeout", "error",
        // "request_calc",
    ]};

    static defaults() {
        return {
            modeDummy: false,           // холостой режим
            connectTimeout: 5000,       // время в мс, через которое запустится проверка подключения сервиса
            portUrgent: false,          // переопределить порт (платы)
            socketAddress: '127.0.0.1', // адрес сокет-сервера
            socketPort: '8005'          // порт сокет-сервера
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
            running: false,
            mode: undefined,
            dev_type: undefined,
        };
    }

    switchDummyMode(on) {
        super.switchDummyMode(on);

        this._terminate();

        this.break(true);

        this.launch();
    }

    getMode() {
        return this._state.mode;
    }

    launch(socket_addr, socket_port) {
        if (this._options.modeDummy) {
            this._debug.log('Working in DUMMY mode');

            let data;

            if (this._state.dev_type != null) {
                data = {is_socket:false, dev_type: this._state.dev_type};
            }

            // setTimeout(() => {
                this.emitEvent("connect", data);
                this.emitEvent("board-status", "default");
            // }, 1000);

            return Promise.resolve();
        } else {
            if (this._options.portUrgent) {
                this.resetPort(this._options.portUrgent);
            }

            return this._launchIPC(socket_addr, socket_port)
                .then(() => this._subscribeToWrapperEvents());
        }
    }

    break(ignore_dummy) {
        if (!this._options.modeDummy || ignore_dummy) {
            if (this._ipc) {
                return this._ipc.disconnect();
            }
        }

        return Promise.resolve();
    }

    getBoardStatus() {
        return this._state.board_status;
    }

    echo(data) {
        this._ipc.send('__echo__', data);
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
            this._state.running = true;

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
    stopExecution(urgent=false) {
        if (this._options.modeDummy) {return true}

        this._ipc.send('stop');

        if (urgent) {
            this.emitEvent('terminate', this._state.check_later);
            this._state.check_later = false;
        }
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

    sendPlates(plates) {
        if (this._options.modeDummy) {return}

        this._ipc.send('plates', plates);
    }

    /**
     * @deprecated
     *
     * @param vectable
     * @returns {Promise<any>}
     */
    sendVectorTable(vectable) {
        if (!vectable) throw new TypeError("Parameter `vectable` is not defined");

        if (this._options.modeDummy) {
            return new Promise(resolve => resolve())
        }

        return new Promise(resolve => {
            // this._ipc.send('vec-update', vectable);

            // this._ipc.once('vec-update.result', (event, error) => {
            //     if (error) {
            //        this._debug.error(error);
            //        throw error;
            //     } else {
            //        resolve();
            //     }
           // });
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

        this._state.mode = mode;
    }

    setIPC(ipc_alias, socket_addr, socket_port) {
        switch (ipc_alias) {
            case 'qt': {
                if (window.qt) {
                    this._useIPCQt();
                } else {
                    throw new Error('Cannot use Qt IPC');
                }
                break;
            }
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

    _terminate() {
        if (this._state.running) {
            this.emitEvent('terminate');
        }
    }

    /**
     * Запустить механизм межпроцессной коммуникации
     *
     * @private
     * @return Promise
     */
    _launchIPC(socket_addr, socket_port) {
        if (this._options.modeDummy) {return true}

        if (this._ipc) {
            this._ipc.disconnect();
        }

        let saddr = socket_addr ? socket_addr : this._options.socketAddress,
            sport = socket_port ? socket_port : this._options.socketPort;

        return new QtIPCWrapper().init()
            .then(ipc => ipc, err => new ElectronIPCWrapper().init())
            .then(ipc => ipc, err => new QtIPCWrapper().init())
            .then(ipc => ipc, err => new SocketIPCWrapper(saddr, sport).init())
            .then(ipc => {
                this._ipc = ipc;

                this._ipc.send('connect');
                this._checkConnection();

                this._options.socketAddress = ipc.addr ? ipc.addr : this._options.socketAddress;
                this._options.socketPort = ipc.port ? ipc.port : this._options.socketPort;

                return ipc;
            }, err => {
                this._debug.panic("IPC panic: no working wrappers found");
                this._options.modeDummy = true;
            });
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
                if (this._ipc && this._ipc.is_socket) {
                    this.emitEvent("disconnect");
                } else {
                    this.emitEvent("timeout");
                }

                this._terminate();
            }
        }, this._options.connectTimeout)
    }

    /**
     * @inheritDoc
     * @private
     */
    _subscribeToWrapperEvents() {
        this._ipc.on('__echo__', (evt, data) => {
            this._debug.info(`ECHO`, data);
        });
        /* Как только сервис сообщил о соединении */
        this._ipc.on('connect', (evt, version) => {
            this._state.connected = true;

            this._state.dev_type = LocalServiceModule.parseDeviceType(version);

            this.emitEvent('connect', {is_socket: this._ipc.is_socket, dev_type: this._state.dev_type});
            this._debug.info(`Connected to IPC ver. ${version}`);
            this._version = version;

            if (this._state.mode) {
                this.setMode(this._state.mode);
            }
        });

        /* Как только сервис сообщил о разъединении */
        this._ipc.on('disconnect', () => {
            this._state.connected = false;

            if (!this._options.modeDummy) {
                this.emitEvent('disconnect');
            }
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
            console.log("VARCH", data);
            this.emitEvent('variable', data);
        });

        /* Как только сервис сообщил о завершении исполнения кода */
        this._ipc.on('terminate', (evt) => {
            this._state.running = false;
            this.emitEvent('terminate', this._state.check_later);
            this._state.check_later = false;
        });

        this._ipc.on('draw_plates', (evt, data) => {
           this.emitEvent('plates', data);
        });

        this._ipc.on('draw_currents', (evt, data) => {
            let arduino_pins = undefined;

            if (data.hasOwnProperty('arduino_pins')) {
                arduino_pins = data.arduino_pins;
                delete data.arduino_pins;
            }

            this.emitEvent('currents', data);

            if (arduino_pins) {
                this.emitEvent('pins_values', arduino_pins);
            }
        });

        // this._ipc.on('request_calc', (evt, data) => {
        //     this.emitEvent('request_calc', data);
        // });

        /* Как только сервис сообщил об ошибке- */
        this._ipc.on('error', (evt, err) => {
            this._debug.error(err);
            // this.emitEvent('error', arg)
        });
    }

    static parseDeviceType(version) {
        let verparts = version.split('/');

        if (verparts[2] in DEVICE_TYPES) {
            return DEVICE_TYPES[verparts[2]];
        } else {
            return DEVICE_TYPES.UNKNOWN;
        }
    }
}