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

    /**
     * Обновить прошивку платы по указанной ссылке
     *
     * @param {Array} urls массив ссылок на файлы прошивки
     */
    upgrade(urls) {
        return new Promise(resolve => {
            this._ipc.send('upgrade', urls);

            this._ipc.once('upgrade-result', (event, error) => {
                if (error) {
                    throw error;
                } else {
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
        this._ipc.on('connect',     ()          => {this._getEventListener('connect')()});
        this._ipc.on('disconnect',  ()          => {this._getEventListener('disconnect')()});
        this._ipc.on('ready',       ()          => {this._getEventListener('ready')()});

        this._ipc.on('error',       (evt, arg)  => {this._getEventListener('error')(arg)});
    }
}

export default LocalServiceModule;