import AsynchronousDatasource from "../../base/model/datasources/AsynchronousDatasource";

export default class AdaptiveAsyncDatasource extends AsynchronousDatasource {
    private data_source: AsynchronousDatasource;
    private readonly data_sources: AsynchronousDatasource[];

    constructor(data_sources: AsynchronousDatasource[]) {
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

    async connect(): Promise<boolean> {
        if (!this.data_source) return false;

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