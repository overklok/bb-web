import cloneDeep from "lodash/cloneDeep";
import Datasource from "./Datasource";
import {ModelEvent} from "../Event";
import IEventService from "../../services/interfaces/IEventService";
import {coverOptions} from "../../helpers/functions";

/**
 * @see Model
 */
export interface ModelConstructor<MS extends ModelState, DS extends Datasource> {
    new(data_source: DS, svc_event: IEventService): Model<MS, DS>;
}

/**
 * An object defining data that the Model should retrieve and/or send.
 *
 * @see Model
 */
export type ModelState = {[key: string]: any}

/**
 * A class defining the data to be displayed to otherwise acted upon in the user interface.
 * It isolates the logic of formatting and validation from other components in the system.
 *
 * In this case, models is separated from objects which actually used to keep actual data.
 * These objects extends from ModelState. Each Model required to define its ModelState.
 */
export default abstract class Model<MS extends ModelState, DS extends Datasource> {
    protected state: MS;
    protected data_source: DS;

    private readonly svc_event: IEventService;

    constructor(data_source: DS, svc_event: IEventService) {
        this.data_source = data_source;
        this.svc_event = svc_event;
    }

    protected abstract defaultState: MS;

    public init(state: Partial<MS>): void {
        this.state = this.defaultState;

        if (state) {
            this.setState(state);
        }
    }

    public setState(state: Partial<MS>): void {
        this.state = coverOptions(state, this.state) as MS;
    }

    public getState() {
        return cloneDeep(this.state);
    }

    protected emit<E>(evt: ModelEvent<E>) {
        if (!this.svc_event) {
            console.warn("Rejected to pass event because there is no active instances of event service", evt);
            return;
        }

        return this.svc_event.emit(evt);
    }
}