import Datasource from "./Datasource";
import {ModelEvent} from "../Event";
import IEventService from "../../services/interfaces/IEventService";

export interface ModelConstructor<MS extends ModelState, DS extends Datasource> {
    new(data_source: DS, svc_event: IEventService, state_initial?: MS): Model<MS, DS>;
}

export interface ModelState {

}

export default abstract class Model<MS extends ModelState, DS extends Datasource> {
    protected state: MS;
    private data_source: DS;
    private svc_event: IEventService;

    constructor(data_source: DS, svc_event: IEventService, state_initial?: MS) {
        this.data_source = data_source;
        this.svc_event = svc_event;

        this.init(state_initial);
    }

    init(state: MS): void {
        this.state = state;
    };

    getState() {
        return this.state;
    }

    protected emit<E>(evt: ModelEvent<E>) {
        this.svc_event.emit(evt);
    }
}