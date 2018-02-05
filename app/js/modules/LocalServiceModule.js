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
    static get event_types()        {return ["connect", "disconnect", "ready", "error"]};

    constructor() {
        super();

        this._ipc = undefined;

        this._launchIPC();

        this._subscribeToWrapperEvents();
    }

    codeUpdate(code) {
        return new Promise(resolve => {
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

    /**
     * Обновить прошивку платы по указанной ссылке
     *
     * @param {Array} urls массив ссылок на файлы прошивки
     */
    firmwareUpgrade(urls) {
        return new Promise(resolve => {
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

        this._ipc.on('ready', () => {
            this.emitEvent('ready');
        });

        this._ipc.on('error', (evt, arg) => {
            this.emitEvent('error', arg)
        });
    }
}

export default LocalServiceModule;