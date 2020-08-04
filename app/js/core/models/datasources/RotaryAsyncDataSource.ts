import AsynchronousDataSource from "../../base/model/datasources/AsynchronousDataSource";

export default class RotaryAsyncDataSource extends AsynchronousDataSource {
    private data_source: AsynchronousDataSource;
    private readonly data_sources: AsynchronousDataSource[];

    constructor(data_sources: AsynchronousDataSource[]) {
        super();

        this.data_sources = data_sources;
    }

    async init(): Promise<boolean> {
        let result = undefined;

        for (const source of this.data_sources) {
            result = await source.init();

            if (result) {
                this.data_source = source;
                break;
            }
        }

        return result;
    }

    async connect(): Promise<object> {
        if (!this.data_source) return Promise.resolve(undefined);

        await this.data_source.connect();
    }

    async disconnect(): Promise<void> {
        if (!this.data_source) return Promise.resolve(undefined);

        await this.data_source.disconnect();
    }

    on(channel: string, handler: Function): void {
        if (!this.data_source) return;

        this.data_source.on(channel, handler);
    }

    once(channel: string, handler: Function): void {
        if (!this.data_source) return;

        this.data_source.once(channel, handler);
    }

    send(channel: string, data: object): void {
        if (!this.data_source) return;

        this.data_source.send(channel, data);
    }
}