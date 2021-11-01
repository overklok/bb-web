/**
 @module AsynchronousModel
*/

import Model from "./Model";
import AsynchronousDatasource, {AsyncDatasourceStatus} from "./datasources/AsynchronousDatasource";
import Application from "../../Application";
import IEventService from "../../services/interfaces/IEventService";

/**
 * Decorates method of the {@link Model} to call it when the given event type is occurred on
 * related {@link Datasource}
 * 
 * @param channels event type(s) to subscribe to
 * @function
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

export function waiting() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_waiting = target[propertyKey];

        return target;
    }
}

export function connect() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_connect = target[propertyKey];

        return target;
    }
}

export function disconnect() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_disconnect = target[propertyKey];

        return target;
    }
}

export function timeout() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        target.handler_timeout = target[propertyKey];

        return target;
    }
}

/**
 * A {@link Model} which listens events from its data source
 * 
 * To subscribe the model to event, apply one of the decorators to one of its methods.
 * 
 * @see listen      subscribes a method to data source event(s) (channel(s))
 * @see waiting     subscribes a method to 
 * @see connect
 * @see disconnect
 * @see timeout
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class AsynchronousModel<MS> extends Model<MS, AsynchronousDatasource> {
    public readonly handlers: {[key: string]: Function};
    public readonly handler_waiting:       Function;
    public readonly handler_timeout:       Function;
    public readonly handler_connect:       Function;
    public readonly handler_disconnect:    Function;

    public counter: number;

    constructor(data_source: AsynchronousDatasource, svc_event: IEventService) {
        super(data_source, svc_event);

        this.counter = 0;

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

    protected send(channel: string, data?: object) {
        if (this.data_source.status === AsyncDatasourceStatus.Connected) {
            this.data_source.send(channel, data);
        }
    }
}