/**
 @module AsynchronousModel
*/

import Model from "./Model";
import AsynchronousDatasource, {AsyncDatasourceStatus} from "./datasources/AsynchronousDatasource";
import IEventService from "../../services/interfaces/IEventService";

/**
 * Decorates method of the {@link Model} to call it when the given event type is occurred on
 * related {@link Datasource}
 * 
 * @param channels event type(s) to subscribe to
 */
export function listen(...channels: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.handlers == null) {
            target.handlers = {};
        }

        for (const channel of channels) {
            target.handlers[channel] = target[propertyKey];
        }

        return target;
    }
}

/**
 * Decorates method of the {@link Model} to call it when the {@link Datasource} is
 * waiting for connection
 */
export function waiting() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_waiting = target[propertyKey];

        return target;
    }
}

/**
 * Decorates method of the {@link Model} to call it when the {@link Datasource} is
 * connected
 */
export function connect() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_connect = target[propertyKey];

        return target;
    }
}

/**
 * Decorates method of the {@link Model} to call it when the {@link Datasource} is
 * disconnected
 */
export function disconnect() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_disconnect = target[propertyKey];

        return target;
    }
}

/**
 * Decorates method of the {@link Model} to call it when the {@link Datasource} 
 * has reached connection timeout
 */
export function timeout() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_timeout = target[propertyKey];

        return target;
    }
}

/**
 * Shortcut for the {@link Model} driven by {@link AsynchronousDatasource}
 * 
 * To subscribe the model to event, apply one of the decorators to one of its methods.
 * 
 * @see listen      calls the method when the message is triggered in the source's event channel
 * @see waiting     calls the method when the {@link Datasource} is establishing connection
 * @see connect     calls the method when the connection is established
 * @see disconnect  calls the method when the connection is closed / broken
 * @see timeout     calls the method when the connection is timeouted
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class AsynchronousModel<MS> extends Model<MS, AsynchronousDatasource> {
    /** Data source event handlers attached via {@link listen} */
    public readonly handlers:               {[key: string]: Function};
    /** Data source event handlers attached via {@link waiting} */
    public readonly handler_waiting:        Function;
    /** Data source event handlers attached via {@link timeout} */
    public readonly handler_timeout:        Function;
    /** Data source event handlers attached via {@link connect} */
    public readonly handler_connect:        Function;
    /** Data source event handlers attached via {@link disconnect} */
    public readonly handler_disconnect:     Function;

    constructor(data_source: AsynchronousDatasource, svc_event: IEventService) {
        super(data_source, svc_event);

        if (this.handlers) {
            for (const [channel, handler] of Object.entries(this.handlers)) {
                this.data_source.on(channel, handler.bind(this));
            }
        } else {
            this.handlers = {};
        }

        this.handler_timeout    && this.data_source.on_timeout(this.handler_timeout.bind(this));
        this.handler_connect    && this.data_source.on_connect(this.handler_connect.bind(this));
        this.handler_disconnect && this.data_source.on_disconnect(this.handler_disconnect.bind(this));

        switch (this.data_source.status) {
            case AsyncDatasourceStatus.Initial:         this.handler_waiting    && this.handler_waiting(); break;
            case AsyncDatasourceStatus.Timeouted:       this.handler_timeout    && this.handler_timeout(); break;
            case AsyncDatasourceStatus.Connected:       this.handler_connect    && this.handler_connect(); break;
            case AsyncDatasourceStatus.Disconnected:    this.handler_disconnect && this.handler_disconnect(); break;
        }
    }

    /**
     * Sends a message to the given channel of the data source
     */
    protected send(channel: string, data?: object) {
        if (this.data_source.status === AsyncDatasourceStatus.Connected) {
            this.data_source.send(channel, data);
        }
    }
}