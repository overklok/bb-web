import Wrapper from '../../core/Wrapper'
import IPCWrapper from "../IPCWrapper";

let ipcRenderer = undefined;

if (require('electron') !== undefined) {
    ipcRenderer = require('electron').ipcRenderer;
}

export default class ElectronIPCWrapper extends IPCWrapper {
    constructor(options) {
        super(options);

        this._channels = new Set();
    }

    init() {
        if (!this.canBeUsed()) {
            return Promise.reject(
                "You cannot use an Electron's IPC in regular browser. Please use another wrapper for IPC."
            );
        } else {
            return Promise.resolve(this);
        }
    }

    canBeUsed() {
        return window && window.process && window.process.type;
    }

    on(channel, handler) {
        ipcRenderer.on(channel, handler);
        this._channels.add(channel);
    }

    once(channel, handler) {
        ipcRenderer.once(channel, handler);
        this._channels.add(channel);
    }

    send(channel, data) {
        ipcRenderer.send(channel, data);
        this._channels.add(channel);
    }

    disconnect() {
        for (let channel of this._channels) {
            ipcRenderer.removeAllListeners(channel);
        }
    }
}