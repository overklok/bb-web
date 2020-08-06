import io from 'socket.io-client';

import AsynchronousDatasource, {AsyncDatasourceStatus} from "../../base/model/datasources/AsynchronousDatasource";

export default class SocketDatasource extends AsynchronousDatasource {
    private static readonly ConnectTimeout = 1500; // ms

    private readonly addr: string;
    private readonly port: number;
    private socket: SocketIOClient.Socket;
    private _handlers: {[key: string]: Function};

    constructor(addr='127.0.0.1', port=8080) {
        super();

        this.addr = addr;
        this.port = port;

        this._handlers = {};
    }

    async init(): Promise<boolean> {
        if (this.socket) return true;

        this.socket = io(`http://${this.addr}:${this.port}`);

        this.socket.on('disconnect', () => {
            this._status = AsyncDatasourceStatus.Disconnected;
            this.emit_disconnect();
            console.debug('[SocketIPC] disconnected.');
        });

        return true;
    }

    async connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this._status !== AsyncDatasourceStatus.Disconnected) {
                resolve(true);
            }

            if (!this.socket.hasListeners('connect')) {
                this.socket.on('connect', () => {
                    this._status = AsyncDatasourceStatus.Connected;
                    console.debug('[SocketIPC] connected.');
                    this.emit_connect();
                    resolve(true);
                });
            }

            setTimeout(() => {
                if (this._status === AsyncDatasourceStatus.Connected) return;

                // we can time-out because connection can be established later
                this._status = AsyncDatasourceStatus.Timeouted;
                console.debug('[SocketIPC] connection timeout.');
                this.emit_timeout();
            }, SocketDatasource.ConnectTimeout);
        });
    }

    async disconnect() {
        if (!this.socket) return;

        this._status = AsyncDatasourceStatus.Disconnected;

        this.socket.disconnect();
    }

    on(channel: string, handler: Function) {
        if (!this.socket) throw new Error("Datasource is not connected to socket");

        this.socket.on(channel, (data: object) => {
            console.debug('[SocketIPC] on', channel, data);
            handler(data);
        });
    }

    once(channel: string, handler: Function) {
        if (!this.socket) throw new Error("Datasource is not connected to socket");

        this.socket.once(channel, (data: object) => {
            console.debug('[SocketIPC] once', channel, data);
            handler(data);
        });
    }

    send(channel: string, data?: object) {
        if (!this.socket) throw new Error("Datasource is not connected to socket");

        console.debug('SocketIPC:send', channel, data);

        this.socket.emit(channel, data);
    }
}