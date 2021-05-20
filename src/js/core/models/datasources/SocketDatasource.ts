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

        this.socket.on('disconnect', (data: any) => {
            this._status = AsyncDatasourceStatus.Disconnected;
            console.debug('[SocketIPC] disconnected.');
            this.emit_disconnect(data);
        });

        return true;
    }

    async connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this._status !== AsyncDatasourceStatus.Disconnected) {
                resolve(true);
            }

            console.debug('[SocketIPC] connecting...');

            // if (!this.socket.hasListeners('connect')) {
                this.socket.on('xconnect', (greeting: any) => {
                    // of course you can use 'connect' instead of 'xconnect' here

                    const cli_version: string = greeting['version'];

                    this._status = AsyncDatasourceStatus.Connected;
                    console.debug(`[SocketIPC] connection established. Client: ${cli_version || 'unknown'}.`);
                    this.emit_connect(greeting);
                    resolve(true);
                });

                setTimeout(() => {
                    if (this._status === AsyncDatasourceStatus.Connected) return;

                    // say time-out because connection might be established later
                    this._status = AsyncDatasourceStatus.Timeouted;
                    console.debug('[SocketIPC] connection timeout.');
                    this.emit_timeout();
                }, SocketDatasource.ConnectTimeout);
            // }
        });
    }

    async disconnect() {
        if (!this.socket) return;

        this.socket.disconnect();
    }

    on(channel: string, handler: Function) {
        super.on(channel, handler);
        // basic 'on' is enough for internal channels (__<name-rounded-with-double-underscores>__)
        if (channel.startsWith('__') && channel.endsWith('__')) return;

        if (!this.socket) throw new Error("Datasource is not connected to socket");

        this.socket.on(channel, (data: object) => {
            console.debug('[SocketIPC] on', channel, data);
            handler(data);
        });
    }

    once(channel: string, handler: Function) {
        super.once(channel, handler);
        // basic 'once' is enough for internal channels (__<name-rounded-with-double-underscores>__)
        if (channel.startsWith('__') && channel.endsWith('__')) return;

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