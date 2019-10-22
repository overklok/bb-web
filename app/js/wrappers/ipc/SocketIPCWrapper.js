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
    }

    on(channel, handler) {
        channel = (channel === 'connect') ? 'xconnect' : channel;
        channel = (channel === 'command') ? 'xcommand' : channel;

        let xhandler = (data) => {handler(undefined, data)};

        this._socket.on(channel, xhandler);
    }

    once(channel, handler) {
        this._socket.once(channel, handler);
    }

    send(channel, data) {
        this._socket.emit(channel, data);
    }

    disconnect() {
        this._socket.disconnect();
    }

    _getFullAddr() {
        return 'http://' + this._addr + ':' + this._port;
    }
}