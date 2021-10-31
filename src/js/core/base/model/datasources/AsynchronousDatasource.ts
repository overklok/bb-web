import Datasource from "../Datasource";

/**
 * @category Core
 */
export enum AsyncDatasourceStatus {
    Initial,
    Connected,
    Disconnected,
    Timeouted
}

/**
 * @category Core
 * @subcategory Model
 */
export default abstract class AsynchronousDatasource extends Datasource {
    protected _status: AsyncDatasourceStatus = AsyncDatasourceStatus.Initial;

    protected handlers: {[channel: string]: {func: Function, disposable: boolean}[]} = {};

    get status() {return this._status};

    abstract init(): Promise<boolean>;
    abstract connect(): Promise<boolean>;
    abstract disconnect(): Promise<void>;

    abstract send(channel: string, data: object): void;

    on(channel: string, handler: Function): void {
        if (!this.handlers[channel]) {
            this.handlers[channel] = [];
        }

        this.handlers[channel].push({func: handler, disposable: false});
    };

    once(channel: string, handler: Function): void {
        if (!this.handlers[channel]) {
            this.handlers[channel] = [];
        }

        this.handlers[channel].push({func: handler, disposable: true});
    };

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

    hasHandlers(channel: string) {
        return this.handlers[channel] && this.handlers[channel].length;
    }

    on_connect(handler: Function) {
        if (!handler) return;
        this.on('__connect__', handler);
    }

    on_disconnect(handler: Function) {
        if (!handler) return;
        this.on('__disconnect__', handler);
    }

    on_timeout(handler: Function) {
        if (!handler) return;
        this.on('__timeout__', handler);
    }

    emit_connect(data?: any) {
        this.handle('__connect__', data);
    }

    emit_disconnect(data?: any) {
        this.handle('__disconnect__', data);
    }

    emit_timeout() {
        this.handle('__timeout__');
    }
}