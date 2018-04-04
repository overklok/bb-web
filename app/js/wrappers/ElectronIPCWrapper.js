import Wrapper from '../core/Wrapper'

let ipcRenderer = undefined;

if (require('electron') !== undefined) {
    ipcRenderer = require('electron').ipcRenderer;
}

export default class ElectronIPCWrapper extends Wrapper {
// public:

    constructor() {
        super();

        if (!window || !window.process || !window.process.type) {
            throw new Error("You cannot use an Electron's IPC in regular browser. Please use another wrapper for IPC.");
            }
    }

    on(channel, handler) {
        ipcRenderer.on(channel, handler);
    }

    once(channel, handler) {
        ipcRenderer.once(channel, handler)
    }

    send(channel, data) {
        ipcRenderer.send(channel, data);
    }

    sendSync(channel, data) {
        ipcRenderer.sendSync(channel, data);
    }



// private:

}