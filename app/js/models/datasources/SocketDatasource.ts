import io from 'socket.io-client';

import AsynchronousDataSource from "../../core/base/model/datasources/AsynchronousDataSource";

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

    async connect(): Promise<void> {
        this.socket = io(`http://${this.addr}:${this.port}`);
    }

    async disconnect() {
        this.socket.disconnect();
    }

    on(channel: string, handler: Function) {
        this._handlers[channel] = (evt: any, data?: object) => {
            console.debug('SocketIPC:on', channel, data);
            handler(channel, data);
        };

        let xhandler = (data?: object) => {this._handlers[channel](undefined, data)};

        this.socket.on(channel, xhandler);
    }

    once(channel: string, handler: Function) {
        this._handlers[channel] = (evt: any, data?: object) => {
            console.debug('SocketIPC:once', channel, data);
            handler(channel, data);
        };

        this.socket.once(channel, this._handlers[channel]);
    }

    send(channel: string, data?: object) {
        console.debug('SocketIPC:send', channel, data);

        this.socket.emit(channel, data);
    }
}