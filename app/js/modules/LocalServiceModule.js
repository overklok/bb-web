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
class LocalServiceModule extends Module {
// public:

    static get eventspace_name()    {return "ls"}
    static get event_types()        {return ["connect", "disconnect", "command", "finish", "error"]};

    static defaults() {
        return {
            modeDummy: false
        }
    }

    constructor(options) {
        super(options);

        this._ipc = undefined;

        /// если режим холостой
        if (this._options.modeDummy) {
            this._debug.log('Working in DUMMY mode');
        } else {
            this._launchIPC();
            this._subscribeToWrapperEvents();
        }
    }

    /**
     * Обновить код на плате
     *
     * @param {string} code код
     */
    updateHandlers(code) {
        return new Promise(resolve => {
            if (this._options.modeDummy) {resolve()}

            this._ipc.send('code-update', code);

            this._ipc.once('code-update-result', (event, error) => {
                if (error) {
                   this._debug.error(error);
                   throw error;
                } else {
                   resolve();
                }
           });
        });
    }

    keyUp(button_code) {
        this._ipc.send('keyup', button_code);
    }

    stop() {
        this._ipc.send('stop');
    }

    /**
     * Обновить прошивку платы по указанной ссылке
     *
     * @param {Array} urls массив ссылок на файлы прошивки
     */
    firmwareUpgrade(urls) {
        return new Promise(resolve => {
            if (this._options.modeDummy) {resolve()}

            this._ipc.send('upgrade', urls);

            this._ipc.once('upgrade-result', (event, error) => {
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

    /**
     * Запустить механизм межпроцессной коммуникации
     *
     * @private
     */
    _launchIPC() {
        if (this._options.modeDummy) {return true};

        if (window && window.process && window.process.type) {
            this._debug.log("Swtiching on IPCWrapper");
            this._ipc = new ElectronIPCWrapper();
        } else {
            this._debug.log("Swtiching on SocketWrapper");
            this._ipc = new SocketWrapper();
        }

        this._ipc.send('connect');
    }

    /**
     * @inheritDoc
     * @private
     */
    _subscribeToWrapperEvents() {
        this._ipc.on('connect', () => {
            this.emitEvent('connect');
            this._debug.info('Connected to IPC');
        });

        this._ipc.on('disconnect', () => {
            this.emitEvent('disconnect');
        });

        // this._ipc.on('ready', () => {
        //     this.emitEvent('ready');
        // });

        this._ipc.on('command', (evt, data) => {
            this.emitEvent('command', data);
        });

        this._ipc.on('finish', (evt) => {
            this.emitEvent('finish');
        });

        this._ipc.on('error', (evt, arg) => {
            this.emitEvent('error', arg)
        });
    }
}

export default LocalServiceModule;