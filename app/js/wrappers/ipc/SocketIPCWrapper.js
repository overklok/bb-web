import Wrapper from '../../core/Wrapper'

import io from 'socket.io-client'
import IPCWrapper from "../IPCWrapper";

export default class SocketIPCWrapper extends IPCWrapper {
    constructor(addr='127.0.0.1', port=8080) {
        super();

        this._addr = addr;
        this._port = port;

        this._socket = io(this._getFullAddr());

        this.is_socket = true;

        this._handlers = {};
    }

    get addr() {
        return this._addr;
    }

    get port() {
        return this._port;
    }

    canBeUsed() {
        return true;
    }

    on(channel, handler) {
        channel = (channel === 'connect') ? 'xconnect' : channel;
        channel = (channel === 'command') ? 'xcommand' : channel;

        this._handlers[channel] = (evt, data) => {
            console.debug('SocketIPC:on', channel, data);
            handler(channel, data);
        };

        let xhandler = (data) => {this._handlers[channel](undefined, data)};

        this._socket.on(channel, xhandler);
    }

    once(channel, handler) {
        this._handlers[channel] = (evt, data) => {
            console.debug('SocketIPC:once', channel, data);
            handler(channel, data);
        };

        this._socket.once(channel, this._handlers[channel]);
    }

    send(channel, data) {
        console.debug('SocketIPC:send', channel, data);

        this._socket.emit(channel, data);
    }

    disconnect() {
        this._socket.disconnect();
    }

    _getFullAddr() {
        return 'http://' + this._addr + ':' + this._port;
    }
}