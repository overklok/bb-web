import Wrapper from '../core/Wrapper'

import io from 'socket.io-client'

class SocketWrapper extends Wrapper {
// public:

    constructor(addr='127.0.0.1', port=8080) {
        super();

        this._addr = addr;
        this._port = port;

        this.socket = io(this._getFullAddr());
    }

    on(name, handler) {
        this.socket.on(name, handler);
    }

// private:

    _getFullAddr() {
        return 'http://' + this._addr + ':' + this._port;
    }
}

export default SocketWrapper;