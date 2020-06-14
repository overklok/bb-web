import {AbstractEvent} from "../../base/Event";

/**
 * @abstract
 */
export default class IEventService {
    public subscribe<V extends AbstractEvent<V>>(event_type: V, handler: Function, obj: any = null):     void {throw new Error('abstract')}
    public reset<V extends AbstractEvent<V>>(event_type: V, obj: any = null):                            void {throw new Error('abstract')}
    public unsubscribe<V extends AbstractEvent<V>>(event_type: V, handler: Function, obj: any = null):   void {throw new Error('abstract')}
    emit<E>(event: AbstractEvent<E>, obj: any = null):                                                   void {throw new Error('abstract')}
}