import {AbstractEvent} from "../../base/Event";

/**
 * A service that supports basic lifecycle of Event objects and provides management API
 * for another parts of {@link Application} to create and handle events of different types.
 *
 * @abstract
 */
export default class IEventService {
    /**
     * Subscribe to specific type of Event
     *
     * Note that this service supports subscription to parent Event classes
     * in order to handle any instance of event_type children.
     *
     * You can subscribe by using an anchor to limit event flow strictly for specific object.
     * Events emitted for other objects (incl. null) wouldn't be handled by the handler function even for the same
     * type of Event.
     * By default, a global anchor (null) will be used.
     *
     * It is not restricted to subscribe same handler to multiple events. To be able to unsubscribe from all of events
     * you might need to subscribe with attaching to specific object (you can use a handler itself) and then call
     * {@link resetObject} to unsubscribe from all events attached to this object.
     *
     *
     * @param event_type    type of Event for which a handler will be fired when event of this type / child type
     *                      will be emitted. Any level of inheritance is supported
     * @param handler       a function to fire when events will be emitted
     * @param anchor        an object that will be used to filter handlers to fire
     */
    subscribe(event_type: typeof AbstractEvent, handler: Function, anchor: any = null): number {throw new Error('abstract')}

    /**
     * Remove all handlers to specific type of Event
     *
     * @param event_type    type of Event for which a handlers that attached to it will be removed
     * @param anchor        an object that will be used to filter handlers to remove
     */
    public reset(event_type: typeof AbstractEvent, anchor: any = null): void {throw new Error('abstract')}

    /**
     * Remove all handlers for specific anchor object
     *
     * @param obj           an object for that all corresponding handlers will be removed
     */
    public resetObject(obj: any = null): void {throw new Error('abstract')}

    /**
     * Remove a specific handler of specific type of Event
     *
     * @param event_type    type of Event for which a handler will be removed
     * @param handler       a handler to unsubscribe from
     * @param anchor        an object that was used when this handler was subscribed
     */
    public unsubscribe(event_type: typeof AbstractEvent, handler: Function, anchor: any = null): void {throw new Error('abstract')}

    /**
     * Emit event
     *
     * When emitting, all related handlers will be fired. If an `anchor` parameter is provided, only handlers that
     * were attached to this object will be fired.
     *
     * @param event         an instance of Event for which handlers will be fired
     * @param anchor        an object that will be used to filter handlers to fire
     */
    public emit<E extends AbstractEvent<E>>(event: E, anchor: any = null): void {throw new Error('abstract')}
}