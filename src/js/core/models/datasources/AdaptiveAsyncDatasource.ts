import AsynchronousDatasource, {AsyncDatasourceStatus} from "../../base/model/datasources/AsynchronousDatasource";

/**
 * A datasource that switches between multiple asynchronous datasources 
 * to find suitable one for connection
 * 
 * @category Core.Models
 * @subcategory Datasources
 */
export default class AdaptiveAsyncDatasource extends AsynchronousDatasource {
    /** datasource chosen at the moment */
    private data_source: AsynchronousDatasource;
    /** datasources to choose from */
    private readonly data_sources: AsynchronousDatasource[];

    constructor(data_sources: AsynchronousDatasource[]) {
        super();

        this.data_sources = data_sources;
    }

    /**
     * Current connection status of active datasource
     * 
     * If there are no datasource chosen, equals to initial status.
     */
    get status(): AsyncDatasourceStatus {
        if (!this.data_source) return AsyncDatasourceStatus.Initial;

        return this.data_source.status
    }

    /**
     * Tries to initialize datasources available until succeeded
     * 
     * @returns whether the data source is detected (connection is possible)
     */
    async init(): Promise<boolean> {
        let result = undefined;

        console.log(`trying to init async datasource (${this.data_sources.length} options available...)`)

        for (const source of this.data_sources) {
            console.debug(`trying ${source.constructor.name}...`)

            result = await source.init();

            if (result) {
                this.data_source = source;
                this.moveEarlyHandlers();
                console.debug(`${source.constructor.name} initialized.`);
                break;
            } else {
                console.debug(`failed to init ${source.constructor.name}, skipping...`)
            }
        }

        return result;
    }

    /**
     * Initializes the connection of currently active datasource if exists 
     * 
     * @returns whether the connection is established
     */
    async connect(): Promise<boolean> {
        if (!this.data_source) return false;

        await this.data_source.connect();
    }

    /**
     * Releases the connection to the data source currently active if exists
     */
    async disconnect(): Promise<void> {
        if (!this.data_source) return Promise.resolve(undefined);

        await this.data_source.disconnect();
    }

    /**
     * @inheritdoc
     */
    on(channel: string, handler: Function): void {
        if (!this.data_source) {
            super.on(channel, handler);
            return;
        }

        this.data_source.on(channel, handler);
    }

    /**
     * @inheritdoc
     */
    once(channel: string, handler: Function): void {
        if (!this.data_source) {
            super.once(channel, handler);
            return;
        }

        this.data_source.once(channel, handler);
    }

    /**
     * @inheritdoc
     */
    send(channel: string, data: object): void {
        if (!this.data_source) return;

        this.data_source.send(channel, data);
    }

    /**
     * @inheritdoc
     */
    handle(channel: string, data: object): void {
        if (!this.data_source) return;

        this.data_source.handle(channel, data);
    }

    /**
     * Applies handlers attached before any datasource is activated
     * to the datasource currently activated
     */
    private moveEarlyHandlers() {
        for (const [channel, handlers] of Object.entries(this.handlers)) {
            for (const {func, disposable} of handlers) {
                if (disposable) {
                    this.data_source.once(channel, func);
                } else {
                    this.data_source.on(channel, func);
                }
            }
        }

        this.handlers = {};
    }
}