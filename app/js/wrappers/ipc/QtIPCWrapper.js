import IPCWrapper from "../IPCWrapper";

let ipcRenderer = undefined;

if (require('qwebchannel') !== undefined) {
    QWebChannel = require('qwebchannel').QWebChannel;
}

export default class QtIPCWrapper extends IPCWrapper {
    constructor(options) {
        super(options);

        if (!window || !window.isQt) {
            throw new Error("You cannot use an Qt's IPC in regular browser. Please use another wrapper for IPC.");
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