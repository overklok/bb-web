import Datasource from "../Datasource";
import Model from "../Model";

export default abstract class AsynchronousDatasource extends Datasource {
    abstract async init(): Promise<boolean>;
    abstract async connect(): Promise<boolean>;
    abstract async disconnect(): Promise<void>;

    abstract on(channel: string, handler: Function): void;
    abstract once(channel: string, handler: Function): void;
    abstract send(channel: string, data: object): void;
}