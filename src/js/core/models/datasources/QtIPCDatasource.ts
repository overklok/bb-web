import AsynchronousDatasource, {AsyncDatasourceStatus} from "../../base/model/datasources/AsynchronousDatasource";
import {sleep} from "../../helpers/functions";

/**
 * @category Core.Models
 * @subcategory Datasources
 */
type QtEventSignal = {
    connect(callback: Function): void;
    disconnect(callback: Function): void;
}

/**
 * @category Core.Models
 * @subcategory Datasources
 */
type QtWebConnector = {} & {
    emit(channel: string, data: string): void;
    event_sig: QtEventSignal;
}

/**
 * @category Core.Models
 * @subcategory Datasources
 */
enum QtWebStatus {
    Initial,
    Connected,
    Disconnected
}

/**
 * An implemenetation of asynchronous data source based on QWebChannel API
 * 
 * Intended to be used in Qt-based WebViews (QtWebEngine).
 * To use in arbitrary browser webpage see {@link SocketDatasource}.
 * 
 * @category Core.Models
 * @subcategory Datasources
 */
export default class QtIPCDatasource extends AsynchronousDatasource {
    // Connection retrieval options
    private static readonly AttemptLimit = 30;
    private static readonly AttemptPeriodInit = 100; // ms
    private static readonly AttemptPeriodConnect = 500; // ms

    // An interactive object passed by Qt side
    private static Connector: QtWebConnector;
    private static Status: QtWebStatus = QtWebStatus.Initial;

    private readonly _handlers: {[key: string]: Function};

    constructor() {
        super();

        this._handlers = {};
    }

    /**
     * @inheritdoc
     */
    get status(): AsyncDatasourceStatus {
        switch (QtIPCDatasource.Status) {
            case QtWebStatus.Initial:       return AsyncDatasourceStatus.Initial;
            case QtWebStatus.Connected:     return AsyncDatasourceStatus.Connected;
            case QtWebStatus.Disconnected:  return AsyncDatasourceStatus.Disconnected;
        }
    }

    /**
     * Waits until QWebChannel interface is possible of timeout is reached
     * 
     * @returns whether the interface is detected
     */
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

    /**
     * Connects to other side by QWebChannel interface found by {@link init}
     * Assigns a common object provided by webChannelTransport
     * 
     * @returns whether the connection is established
     */
    connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (QtIPCDatasource.Status === QtWebStatus.Connected) {
                resolve(false);
                return;
            }

            QtIPCDatasource.Status = QtWebStatus.Disconnected;

            this.once('connect', (greeting: any) => {
                QtIPCDatasource.Status = QtWebStatus.Connected;

                const cli_version: any = greeting['version'] && greeting['version']['comm'];

                console.log(`connection established. Client: ${cli_version}`);

                clearInterval(rep);
                this.emit_connect(greeting);
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

    /**
     * Send a disconnection signal to other side via QWebChannel interface
     * Detaches a common object provided by webChannelTransport
     */
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

    /**
     * @inheritdoc
     */
    send(channel: string, data?: object) {
        if (QtIPCDatasource.Status !== QtWebStatus.Connected) throw new Error("Datasource is not connected to Qt");

        console.debug('[QtIPC] send', channel, data);
        QtIPCDatasource.Connector.emit(channel, JSON.stringify(data));
    }

    /**
     * Checks QWebChannel API availability
     * 
     * @returns whether the interface is loaded into the page 
     */
    private static isPossible(): boolean {
        return !!window.QWebChannel;
    }

    /**
     * Checks QWebChannel connector availability 
     * 
     * @returns whether the connector is available
     */
    private static isReady(): boolean {
        return !!window.qt;
    }

    /**
     * Checks QWebChannel's common object (signal emiiter) is provided
     * 
     * @returns whether the other side of QWebChannel interface is provided the common object
     */
    private static isConnected(): boolean {
        return !!(QtIPCDatasource.Connector && QtIPCDatasource.Connector.event_sig);
    }

    /**
     * Handles event signal emission
     * 
     * @param channel channel identifier
     * @param data data provided in the message
     */
    private onEventSig(channel: string, data: string) {
        console.debug('[QtIPC] received', channel, data);

        if (this.hasHandlers(channel)) {
            data = JSON.parse(data);
            this.handle(channel, data);
        }
    }
}

declare global {
  /**
   * TypeScript declaration for QWebChannelMessageTypes
   */
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

  /**
   * TypeScript declaration for QWebChannelTransport
   */
  type QWebChannelTransport = {
    webChannelTransport: any;
  }

  /**
   * TypeScript declarations for QWebChannel library
   */
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