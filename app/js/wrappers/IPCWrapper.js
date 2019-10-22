import Wrapper from "../core/Wrapper";

export default class IPCWrapper extends Wrapper {
    constructor(options) {
        super(options);
    }

    on(channel, handler) {
        throw new Error("Method is not implemented");
    }

    once(channel, handler) {
        throw new Error("Method is not implemented");
    }

    send(channel, data) {
        throw new Error("Method is not implemented");
    }

    disconnect() {
        throw new Error("Method is not implemented");
    }
}