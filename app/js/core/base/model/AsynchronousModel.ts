import Model from "./Model";
import AsynchronousDatasource, {AsyncDatasourceStatus} from "./datasources/AsynchronousDatasource";
import Application from "../../Application";
import IEventService from "../../services/interfaces/IEventService";

export function listen(channel: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.handlers == null) {
            target.handlers = {};
        }

        target.handlers[channel] = target[propertyKey];

        console.log(target, channel);

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

export default abstract class AsynchronousModel<MS> extends Model<MS, AsynchronousDatasource> {
    public readonly handlers: {[key: string]: Function} = {};
    public readonly handler_timeout:       Function;
    public readonly handler_connect:       Function;
    public readonly handler_disconnect:    Function;

    constructor(data_source: AsynchronousDatasource, svc_event: IEventService) {
        super(data_source, svc_event);
    }

    public init(state: MS) {
        super.init(state);

        console.log(this);

        for (const [channel, handler] of Object.entries(this.handlers)) {
            this.data_source.on(channel, handler.bind(this));
        }

        if (this.handler_timeout)       this.data_source.on_timeout(this.handler_timeout.bind(this));
        if (this.handler_connect)       this.data_source.on_connect(this.handler_connect.bind(this));
        if (this.handler_disconnect)    this.data_source.on_disconnect(this.handler_disconnect.bind(this));

        switch (this.data_source.status) {
            case AsyncDatasourceStatus.Timeouted:       if (this.handler_timeout)    this.handler_timeout(); break;
            case AsyncDatasourceStatus.Connected:       if (this.handler_connect)    this.handler_connect(); break;
            case AsyncDatasourceStatus.Disconnected:    if (this.handler_disconnect) this.handler_disconnect(); break;
        }
    }

    protected send(channel: string, data?: object) {
        if (this.data_source.status === AsyncDatasourceStatus.Connected) {
            this.data_source.send(channel, data);
        }
    }
}