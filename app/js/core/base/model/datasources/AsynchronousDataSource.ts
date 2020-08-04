import DataSource from "../DataSource";
import Model from "../Model";

export default abstract class AsynchronousDataSource extends DataSource {
    abstract async connect(): Promise<void>;
    abstract async disconnect(): Promise<void>;

    abstract on(channel: string, handler: Function): void;
    abstract once(channel: string, handler: Function): void;
    abstract send(channel: string, data: object): void;
}