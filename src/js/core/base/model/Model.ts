import defaults from "lodash/defaults";
import defaultsDeep from "lodash/defaultsDeep";
import cloneDeep from "lodash/cloneDeep";
import Datasource from "./Datasource";
import {ModelEvent} from "../Event";
import IEventService from "../../services/interfaces/IEventService";

/**
 * @see Model
 * 
 * @category Core
 * @subcategory Model
 */
export interface ModelConstructor<MS extends ModelState, DS extends Datasource> {
    new(data_source: DS, svc_event: IEventService): Model<MS, DS>;
}

/**
 * Contains data of specific subject area {@link Model} 
 *
 * @see Model
 * 
 * @category Core
 * @subcategory Model
 */
export type ModelState = {[key: string]: any}

/**
 * Provides data of some subject area ({@link ModelState}) taken from its source ({@link Datasource})
 * 
 * Isolates the logic of data processing from other components of the system.
 *
 * Models are separated from data objects they serve.
 * These data objects extends {@link ModelState}. 
 * 
 * Each Model is required to define its {@link ModelState} and the mechanism it
 * uses to gather the data, {@link Datasource}.
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class Model<MS extends ModelState, DS extends Datasource> {
    static alias: string;

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

    /**
     * Assigns new values of the state from the given partial state
     * 
     * @param state partial state to assign the values from
     * @param deep  copy the values recursively
     */
    public setState(state: Partial<MS>, deep=false): void {
        const fn = deep ? defaultsDeep : defaults;

        this.state = fn(cloneDeep(state), this.state) as MS;
    }

    /**
     * Makes the copy of the state object and returns it
     * 
     * As the state object is copied, it can be safely mutated.
     * 
     * @returns an object containing current modal state 
     */
    public getState(): MS {
        return cloneDeep(this.state);
    }

    /**
     * Emits event by the {@link Model} 
     * 
     * @param evt the event instance to be passed
     * 
     * @returns release when the event is handled
     */
    protected emit<E>(evt: ModelEvent<E>) {
        if (!this.svc_event) {
            console.warn("Rejected to pass event because there is no active instances of event service", evt);
            return;
        }

        return this.svc_event.emit(evt);
    }
}