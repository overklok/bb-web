import Wrapper from '../../core/Wrapper'
import IPCWrapper from "../IPCWrapper";

let ipcRenderer = undefined;

if (require('electron') !== undefined) {
    ipcRenderer = require('electron').ipcRenderer;
}

export default class ElectronIPCWrapper extends IPCWrapper {
    constructor(options) {
        super(options);

        if (!window || !window.process || !window.process.type) {
            throw new Error("You cannot use an Electron's IPC in regular browser. Please use another wrapper for IPC.");
        }

        this._channels = new Set();
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