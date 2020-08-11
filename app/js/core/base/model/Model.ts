import Datasource from "./Datasource";
import {ModelEvent} from "../Event";
import IEventService from "../../services/interfaces/IEventService";
import {coverOptions} from "../../helpers/functions";

export interface ModelConstructor<MS extends ModelState, DS extends Datasource> {
    new(data_source: DS, svc_event: IEventService): Model<MS, DS>;
}

export type ModelState = {[key: string]: any}

export default abstract class Model<MS extends ModelState, DS extends Datasource> {
    protected state: MS;
    protected data_source: DS;

    private readonly svc_event: IEventService;

    constructor(data_source: DS, svc_event: IEventService) {
        this.data_source = data_source;
        this.svc_event = svc_event;
        this.state = this.defaultState();
    }

    protected abstract defaultState(): MS;

    public init(state: MS): void {
        if (!state) return;

        this.state = state;
    }

    public setState<K extends keyof MS>(
        state: ((prevState: Readonly<MS>) => (Pick<MS, K> | MS | null)) | (Pick<MS, K> | MS | null)
    ): void {
        this.state = coverOptions(state, this.state) as MS;
    }

    public getState() {
        return this.state;
    }

    protected emit<E>(evt: ModelEvent<E>) {
        if (!this.svc_event) {
            console.warn("Rejected to pass event because there is no active instances of event service", evt);
            return;
        }

        this.svc_event.emit(evt);
    }
}