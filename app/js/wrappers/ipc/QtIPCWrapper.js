import IPCWrapper from "../IPCWrapper";

const HANDLERS_LIMIT = 20;

let G_CONNECTOR = undefined;
let G_IS_DISCONNECTING = true;

// TODO: Move _connect() routine to global scope

export default class QtIPCWrapper extends IPCWrapper {

    constructor(options) {
        super(options);

        this._handlers = {};
    }

    canBeUsed() {
        return !!window.QWebChannel;
    }

    init() {
        if (!this.canBeUsed()) {
            return Promise.reject(
                "You cannot use an Qt's IPC in regular browser. Please use another wrapper for IPC."
            );
        }

        return this.disconnect()
            .then(() => this._connect());
    }

    on(channel, handler) {
        this._handlers[channel] = (...data) => {
            console.debug('QtIPC:on', channel, data);
            handler(...data);
        }
    }

    once(channel, handler) {
        this._handlers[channel] = (data) => {
            handler(data);
            delete this._handlers[channel];
        };
    }

    send(channel, data) {
        console.debug('QtIPC:send', channel, data);
        G_CONNECTOR.emit(channel, data);
    }

    disconnect() {
        return new Promise(resolve => {
            if (G_CONNECTOR && G_CONNECTOR.event_sig && !G_IS_DISCONNECTING) {
                G_IS_DISCONNECTING = true;

                G_CONNECTOR.event_sig.disconnect(() => {
                    G_CONNECTOR = undefined;
                    G_IS_DISCONNECTING = false;

                    resolve();
                });
            } else {
                resolve();
            }
        })
    }

    _connect() {
        return new Promise((resolve, reject) => {
            let rep = setInterval(() => {
                if (!window.qt) {
                    console.log("waiting for window.qt to appear");
                } else {
                    new QWebChannel(window.qt.webChannelTransport, channel => {
                        G_CONNECTOR = channel.objects.connector;

                        if (G_CONNECTOR && G_CONNECTOR.event_sig) {
                            G_CONNECTOR.event_sig.connect(this._onEventSig.bind(this));

                            clearInterval(rep);
                            resolve(this);
                        } else {
                            clearInterval(rep);
                            reject();
                        }
                    });
                }
            }, 500);
        });
    }

    _onEventSig(channel, data) {
        if (channel in this._handlers) {
            this._handlers[channel]({channel}, data);
        }
    }
}