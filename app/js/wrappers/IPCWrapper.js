import Wrapper from "../core/Wrapper";

export default class IPCWrapper extends Wrapper {
    constructor(options) {
        super(options);
    }

    /**
     * @abstract
     */
    canBeUsed() {
        throw new Error("Method is not implemented");
    }

    init() {
        return this.canBeUsed() ? Promise.resolve(this) : Promise.reject();
    }

    /**
     * @abstract
     *
     * @param channel
     * @param handler
     */
    on(channel, handler) {
        throw new Error("Method is not implemented");
    }

    /**
     * @abstract
     *
     * @param channel
     * @param handler
     */
    once(channel, handler) {
        throw new Error("Method is not implemented");
    }

    /**
     * @abstract
     *
     * @param channel
     * @param data
     */
    send(channel, data) {
        throw new Error("Method is not implemented");
    }

    /**
     * @abstract
     *
     * @return Promise
     */
    disconnect() {
        throw new Error("Method is not implemented");
    }
}