import AsynchronousDatasource, {AsyncDatasourceStatus} from "../../base/model/datasources/AsynchronousDatasource";
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
    Initial,
    Connected,
    Disconnected
}

export default class QtIPCDatasource extends AsynchronousDatasource {
    // Connection retrieval options
    private static readonly AttemptLimit = 15;
    private static readonly AttemptPeriodInit = 50; // ms
    private static readonly AttemptPeriodConnect = 500; // ms

    // An interactive object passed by Qt side
    private static Connector: QtWebConnector;
    private static Status: QtWebStatus = QtWebStatus.Initial;

    private readonly _handlers: {[key: string]: Function};

    constructor() {
        super();

        this._handlers = {};
    }

    get status(): AsyncDatasourceStatus {
        switch (QtIPCDatasource.Status) {
            case QtWebStatus.Initial:       return AsyncDatasourceStatus.Initial;
            case QtWebStatus.Connected:     return AsyncDatasourceStatus.Connected;
            case QtWebStatus.Disconnected:  return AsyncDatasourceStatus.Disconnected;
        }
    }

    async init(): Promise<boolean> {
        if (QtIPCDatasource.Status === QtWebStatus.Connected) return;

        for (let att = 0; att < QtIPCDatasource.AttemptLimit; att++) {
            if (QtIPCDatasource.isPossible()) {
                console.debug('[QtIPC] initialized.');
                return true;
            }

            await sleep(QtIPCDatasource.AttemptPeriodInit);

            console.debug('[QtIPC] initializing...');
        }

        return false;
    }

    connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (QtIPCDatasource.Status === QtWebStatus.Connected) {
                resolve(false);
                return;
            }

            QtIPCDatasource.Status = QtWebStatus.Disconnected;

            this.once('connect', (cli_descriptor: string) => {
                QtIPCDatasource.Status = QtWebStatus.Connected;

                console.log(`connection established. Client: ${cli_descriptor}`);

                clearInterval(rep);
                this.emit_connect();
                resolve(true);
            });

            const rep = setInterval(() => {
                if (!QtIPCDatasource.isReady()) {
                    console.debug("[QtIPC] waiting for readiness...");
                } else {
                    console.debug("[QtIPC] ready, preparing the connector...");

                    new QWebChannel(window.qt.webChannelTransport, channel => {
                        QtIPCDatasource.Connector = channel.objects.connector;

                        if (QtIPCDatasource.isConnected()) {
                            QtIPCDatasource.Connector.event_sig.connect(this.onEventSig.bind(this));

                            console.debug('[QtIPC] a connection is possible now, connecting...');

                            QtIPCDatasource.Connector.emit('connect', null);
                        } else {
                            clearInterval(rep);
                            QtIPCDatasource.Status = QtWebStatus.Disconnected;
                            // we doesn't need time-out behaviour here
                            console.debug('[QtIPC] connection rejected.');
                            this.emit_disconnect();
                            reject();
                        }
                    });
                }
            }, QtIPCDatasource.AttemptPeriodConnect);
        });
    }

    disconnect(): Promise<void> {
        return new Promise(resolve => {
            if (QtIPCDatasource.Status === QtWebStatus.Disconnected) {
                resolve();
            } else {
                QtIPCDatasource.Connector.event_sig.disconnect(() => {
                    QtIPCDatasource.Connector = undefined;
                    QtIPCDatasource.Status = QtWebStatus.Disconnected;

                    this.emit_disconnect();
                    resolve();
                });
            }
        })
    }

    send(channel: string, data?: object) {
        if (QtIPCDatasource.Status !== QtWebStatus.Connected) throw new Error("Datasource is not connected to Qt");

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
        console.debug('[QtIPC] received', channel, data);

        if (this.hasHandlers(channel)) {
            data = JSON.parse(data);
            this.handle(channel, data);
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