import Datasource from "../Datasource";

export enum AsyncDatasourceStatus {
    Initial,
    Connected,
    Disconnected,
    Timeouted
}

export default abstract class AsynchronousDatasource extends Datasource {
    protected _status: AsyncDatasourceStatus = AsyncDatasourceStatus.Initial;

    protected handlers_timeout: Function[] = [];
    protected handlers_connect: Function[] = [];
    protected handlers_disconnect: Function[] = [];

    get status() {return this._status};

    abstract async init(): Promise<boolean>;
    abstract async connect(): Promise<boolean>;
    abstract async disconnect(): Promise<void>;

    abstract on(channel: string, handler: Function): void;
    abstract once(channel: string, handler: Function): void;
    abstract send(channel: string, data: object): void;

    on_connect(handler: Function) {
        if (!handler) return;
        this.handlers_connect.push(handler);
    }

    on_disconnect(handler: Function) {
        if (!handler) return;
        this.handlers_disconnect.push(handler);
    }

    on_timeout(handler: Function) {
        if (!handler) return;
        this.handlers_timeout.push(handler);
    }

    emit_connect() {
        for (const handler of this.handlers_connect) {
            handler();
        }
    }

    emit_disconnect() {
        for (const handler of this.handlers_disconnect) {
            handler();
        }
    }

    emit_timeout() {
        for (const handler of this.handlers_timeout) {
            handler();
        }
    }
}