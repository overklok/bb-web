import {AbstractEvent} from "../../base/Event";
import { NotImplementedError } from "../../helpers/exceptions/notimplemented";


export class EventHandlingError extends Error {
    public suberrors: Error[];

    constructor(message: string, reasons: Error[]) {
        super(message);
        Object.setPrototypeOf(this, EventHandlingError.prototype);
        this.suberrors = reasons;
    }
}

/**
 * A service that supports basic lifecycle of Event objects and provides management API
 * for another parts of {@link Application} to create and handle events of different types.
 * 
 * Note that this is an interface, although it's defined as a class just to keep it available in runtime.
 *
 * @abstract
 * 
 * @category Core
 * @subcategory Service
 */
export default class IEventService {
    /**
     * Subscribes to specific type of Event
     *
     * Note that this service supports subscription to parent Event classes
     * in order to handle any instance of event_type children.
     *
     * You can subscribe by using an anchor to limit event flow strictly for specific object.
     * Events emitted for other objects (incl. `null`) wouldn't be handled by the handler function
     * even for the same type of Event.
     * By default, a global anchor (`null`) will be used.
     *
     * It is not restricted to subscribe same handler to multiple events. To be able to unsubscribe from all of events
     * you might need to subscribe with attaching to specific object (you can use a handler itself) and then call
     * {@link resetObject} to unsubscribe from all events attached to this object.
     *
     * If you need to reenact the state of the anchor object before subscription
     * you might need to restore last event emitted for it. To do so, set `emit_last` parameter to `true`.
     *
     * @param event_type    type of Event for which a handler will be fired when event of this type / child type
     *                      will be emitted. Any level of inheritance is supported
     * @param handler       a function to fire when events will be emitted
     * @param anchor        an object that will be used to filter handlers to fire
     * @param emit_last     automatically re-emit last emitted event (available for non-default anchors only)
     *
     * @return number of presenters of event provided and attached to anchor provided
     */
    async subscribe(event_type: typeof AbstractEvent,
              handler: Function,
              anchor?: any,
              emit_last?: boolean
    ): Promise<number> {throw new NotImplementedError('abstract')}

    /**
     * Removes all handlers to specific type of Event
     *
     * @param event_type    type of Event for which a handlers that attached to it will be removed
     * @param anchor        an object that will be used to filter handlers to remove
     */
    public reset(event_type: typeof AbstractEvent,
                 anchor?: any
    ): void {throw new NotImplementedError('abstract')}

    /**
     * Removes all handlers for specific anchor object
     *
     * @param obj           an object for that all corresponding handlers will be removed
     */
    public resetObject(obj?: any): void {throw new NotImplementedError('abstract')}

    /**
     * Removes a specific handler of specific type of Event
     *
     * @param event_type    type of Event for which a handler will be removed
     * @param handler       a handler to unsubscribe from
     * @param anchor        an object that was used when this handler was subscribed
     */
    public unsubscribe(
        event_type: typeof AbstractEvent,
        handler: Function,
        anchor?: any
    ): void {throw new NotImplementedError('abstract')}

    /**
     * Emits an event 
     *
     * When emitting, all related handlers will be fired. If an `anchor` parameter is provided, only handlers that
     * were attached to this object will be fired.
     *
     * @param event         an instance of Event for which the handlers will be called
     * @param anchor        an object that will be used to filter handlers to call
     * 
     * @returns release when an event is handled
     */
    public async emit<E extends AbstractEvent<E>>(
        event: E,
        anchor?: any
    ) {throw new NotImplementedError('abstract')}
}