import AsynchronousDatasource from "../../base/model/datasources/AsynchronousDatasource";
import {sleep} from "../../helpers/functions";

type QtEventSignal = {
    connect(callback: Function): void;
    disconnect(callback: Function): void;
}

type QtWebConnector = {} & {
    emit(channel: string, data: string): void;
    event_sig: QtEventSignal;
}

enum QtWebStatus {
    Connecting,
    Connected,
    Disconnecting,
    Disconnected
}

export default class QtIPCDatasource extends AsynchronousDatasource {
    // Connection retrieval options
    private static readonly AttemptLimit = 5;
    private static readonly AttemptPeriodInit = 50; // ms
    private static readonly AttemptPeriodConnect = 500; // ms

    // An interactive object passed by Qt side
    private static Connector: QtWebConnector;
    private static Status: QtWebStatus = QtWebStatus.Disconnected;

    private readonly _handlers: {[key: string]: Function};

    constructor() {
        super();

        this._handlers = {};
    }

    async init(): Promise<boolean> {
        if (QtIPCDatasource.Status !== QtWebStatus.Disconnected) return;

        for (let att = 0; att < QtIPCDatasource.AttemptLimit; att++) {
            if (QtIPCDatasource.isPossible()) {
                console.debug('[QtIPC] initialized.');
                return true;
            }

            await sleep(QtIPCDatasource.AttemptPeriodInit);

            console.debug('[QtIPC] initializing...');
        }

        console.warn("You cannot use an Qt's IPC in regular browser. Please use another wrapper for IPC.");

        return false;
    }

    connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (QtIPCDatasource.Status !== QtWebStatus.Disconnected) {
                resolve(false);
                return;
            }

            QtIPCDatasource.Status = QtWebStatus.Connecting;

            const rep = setInterval(() => {
                if (!QtIPCDatasource.isReady()) {
                    console.debug("[QtIPC] waiting for readiness...");
                } else {
                    console.debug("[QtIPC] ready, connecting...");

                    new QWebChannel(window.qt.webChannelTransport, channel => {
                        QtIPCDatasource.Connector = channel.objects.connector;

                        if (QtIPCDatasource.isConnected()) {
                            QtIPCDatasource.Connector.event_sig.connect(this.onEventSig.bind(this));
                            QtIPCDatasource.Status = QtWebStatus.Connected;

                            clearInterval(rep);
                            console.debug('[QtIPC] connected.');
                            resolve(true);
                        } else {
                            clearInterval(rep);
                            reject();
                        }
                    });
                }
            }, QtIPCDatasource.AttemptPeriodConnect);
        });
    }

    disconnect(): Promise<void> {
        return new Promise(resolve => {
            if (!(QtIPCDatasource.Status !== QtWebStatus.Connected)) {
                resolve();
            } else {
                QtIPCDatasource.Status = QtWebStatus.Disconnecting;

                QtIPCDatasource.Connector.event_sig.disconnect(() => {
                    QtIPCDatasource.Connector = undefined;
                    QtIPCDatasource.Status = QtWebStatus.Disconnected;

                    resolve();
                });
            }
        })
    }

    on(channel: string, handler: Function) {
        if (!(QtIPCDatasource.Status !== QtWebStatus.Connected)) throw new Error("Datasource is not connected to Qt");

        this._handlers[channel] = (evt: any, data: string) => {
            data = JSON.parse(data);

            console.debug('[QtIPC] received', channel, data);

            handler(channel, data);
        }
    }

    once(channel: string, handler: Function) {
        if (!(QtIPCDatasource.Status !== QtWebStatus.Connected)) throw new Error("Datasource is not connected to Qt");

        this._handlers[channel] = (data: string) => {
            handler(JSON.parse(data));
            delete this._handlers[channel];
        };
    }

    send(channel: string, data?: object) {
        if (!(QtIPCDatasource.Status !== QtWebStatus.Connected)) throw new Error("Datasource is not connected to Qt");

        console.debug('[QtIPC] send', channel, data);

        QtIPCDatasource.Connector.emit(channel, JSON.stringify(data));
    }

    private static isPossible(): boolean {
        return !!window.QWebChannel;
    }

    private static isReady(): boolean {
        return !!window.qt;
    }

    private static isConnected(): boolean {
        return !!(QtIPCDatasource.Connector && QtIPCDatasource.Connector.event_sig);
    }

    private onEventSig(channel: string, data: string) {
        if (channel in this._handlers) {
            this._handlers[channel]({channel}, data);
        }
    }
}

declare global {
  const enum QWebChannelMessageTypes {
    signal = 1,
    propertyUpdate = 2,
    init = 3,
    idle = 4,
    debug = 5,
    invokeMethod = 6,
    connectToSignal = 7,
    disconnectFromSignal = 8,
    setProperty = 9,
    response = 10,
  }

  type QWebChannelTransport = {
    webChannelTransport: any;
  }

  class QWebChannel {
    constructor (transport: WebSocket, initCallback: (channel: QWebChannel) => void);

    objects: any;

    send(data: any): void;
    exec(data: any, callback: (data: any) => void): void;
    handleSignal(message: MessageEvent): void;
    handleResponse(message: MessageEvent): void;
    handlePropertyUpdate(message: MessageEvent): void;
  }

  interface Window {
    QWebChannel: QWebChannel;
    qt: QWebChannelTransport;
  }
}