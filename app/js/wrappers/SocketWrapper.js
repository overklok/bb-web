import Wrapper from '../core/Wrapper'

import io from 'socket.io-client'

class SocketWrapper extends Wrapper {
// public:

    constructor(addr='localhost', port=8080) {
        super();

        this.socket = io(this._getFullAddr());
    }

// private:

    _getFullAddr() {
        return 'http://' + this.addr + ':' + this.port;
    }
}

export default SocketWrapper;