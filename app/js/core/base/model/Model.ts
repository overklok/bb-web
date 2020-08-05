import Datasource from "./Datasource";
import {ModelEvent} from "../Event";
import IEventService from "../../services/interfaces/IEventService";

export interface ModelConstructor<V extends Datasource> {
    new(data_source: V, svc_event: IEventService, state_initial?: object): Model<any>;
}

export default abstract class Model<V extends Datasource> {
    private data_source: V;
    private svc_event: IEventService;

    constructor(data_source: V, svc_event: IEventService, state_initial?: object) {
        this.data_source = data_source;
        this.svc_event = svc_event;

        this.init(state_initial);
    }

    abstract init(state?: object): void;

    abstract load(): boolean;
    abstract save(): void;

    protected emit<E>(evt: ModelEvent<E>) {
        this.svc_event.emit(evt);
    }
}