import io from 'socket.io-client';

import AsynchronousDataSource from "../../base/model/datasources/AsynchronousDataSource";

export default class SocketDatasource extends AsynchronousDataSource {
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
        this.socket = io(`http://${this.addr}:${this.port}`);

        return true;
    }

    async connect(): Promise<object> {
        this.send('connect');

        // TODO: wait for answer or fail

        return undefined;
    }

    async disconnect() {
        if (!this.socket) return;

        this.socket.disconnect();
    }

    on(channel: string, handler: Function) {
        if (!this.socket) throw new Error("Datasource is not connected to socket");

        this._handlers[channel] = (evt: any, data?: object) => {
            console.debug('SocketIPC:on', channel, data);
            handler(channel, data);
        };

        let xhandler = (data?: object) => {this._handlers[channel](undefined, data)};

        this.socket.on(channel, xhandler);
    }

    once(channel: string, handler: Function) {
        if (!this.socket) throw new Error("Datasource is not connected to socket");

        this._handlers[channel] = (evt: any, data?: object) => {
            console.debug('SocketIPC:once', channel, data);
            handler(channel, data);
        };

        this.socket.once(channel, this._handlers[channel]);
    }

    send(channel: string, data?: object) {
        if (!this.socket) throw new Error("Datasource is not connected to socket");

        console.debug('SocketIPC:send', channel, data);

        this.socket.emit(channel, data);
    }
}