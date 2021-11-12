import Datasource from "../Datasource";

/**
 * Stages of {@link AsynchronousDatasource} connection status
 * 
 * @category Core
 * @subcategory Model
 */
export enum AsyncDatasourceStatus {
    Initial,
    Connected,
    Disconnected,
    Timeouted
}

/**
 * An implementation of asynchronous data exchange protocol
 * 
 * Provides an API to subscribe to events and send data to source.
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class AsynchronousDatasource extends Datasource {
    protected _status: AsyncDatasourceStatus = AsyncDatasourceStatus.Initial;

    protected handlers: {[channel: string]: {func: Function, disposable: boolean}[]} = {};

    get status() {return this._status};

    /**
     * Detects data source connection conditions
     * 
     * Is is possible to make multiple attepmts in order to
     * detect the source if it requires some time to be found.
     * 
     * @returns whether the data source is detected (connection is possible)
     */
    abstract init(): Promise<boolean>;

    /**
     * Initializes the connection to the data source
     * 
     * It is possible to make multiple attempts until the connection is
     * established.
     * 
     * @returns whether the connection is established
     */
    abstract connect(): Promise<boolean>;

    /**
     * Releases the connection to the data source
     */
    abstract disconnect(): Promise<void>;

    /**
     * Sends a message to specified `channel` of the data source
     * 
     * @param channel   string identifier of the type of event being handled by the source
     * @param data      arbitrary content of the message 
     */
    abstract send(channel: string, data: object): void;

    /**
     * Attaches an event handler for the specified `channel` of the data source
     * 
     * Handler call order is defined by the order of the attachment.
     * 
     * @param channel   string identifier of the type of event emitted by the source
     * @param handler   handler function to attach
     */
    on(channel: string, handler: Function): void {
        if (!this.handlers[channel]) {
            this.handlers[channel] = [];
        }

        this.handlers[channel].push({func: handler, disposable: false});
    };

    /**
     * Attaches an event handler for the specified `channel` of the data source
     * and detaches it after a single message is received
     * 
     * Handler call order is defined by the order of the attachment.
     * 
     * @param channel   string identifier of the type of event emitted by the source
     * @param handler   handler function to attach
     */
    once(channel: string, handler: Function): void {
        if (!this.handlers[channel]) {
            this.handlers[channel] = [];
        }

        this.handlers[channel].push({func: handler, disposable: true});
    };

    /**
     * Calls all handlers attached to the `channel` of the data source
     * 
     * @see on
     * @see once
     * 
     * @param channel   string identifier of the type of event needed to handle
     * @param data      data to pass to the handlers
     */
    handle(channel: string, data?: any): void {
        if (this.handlers[channel]) {
            for (const [key, handler] of this.handlers[channel].entries()) {
                handler.func(data);

                if (handler.disposable) {
                    delete this.handlers[channel][key];
                }
            }
        }
    }

    /**
     * @param channel string identifier of the type of event
     * 
     * @returns whether the handlers are attached to the channel
     */
    hasHandlers(channel: string) {
        return this.handlers[channel] && this.handlers[channel].length;
    }

    /**
     * Attaches the function to call when the connection is established
     * 
     * @param handler handler function to attach
     */
    on_connect(handler: Function) {
        if (!handler) return;
        this.on('__connect__', handler);
    }

    /**
     * Attaches the function to call when the data source is disconnected
     * 
     * @param handler handler function to attach
     */
    on_disconnect(handler: Function) {
        if (!handler) return;
        this.on('__disconnect__', handler);
    }

    /**
     * Attaches the function to call when the data source connection is timeouted
     * 
     * @param handler handler function to attach
     */
    on_timeout(handler: Function) {
        if (!handler) return;
        this.on('__timeout__', handler);
    }

    /**
     * Calls data source connection handler
     * 
     * @param data initial data provided by the data source
     */
    emit_connect(data?: any) {
        this.handle('__connect__', data);
    }

    /**
     * Calls data source disconnection handler
     * 
     * @param data final data provided by the data source
     */
    emit_disconnect(data?: any) {
        this.handle('__disconnect__', data);
    }

    /**
     * Calls data source connection timeout handler
     */
    emit_timeout() {
        this.handle('__timeout__');
    }
}