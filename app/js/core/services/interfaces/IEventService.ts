import {AbstractEvent} from "../../base/Event";

/**
 * @abstract
 */
export default class IEventService {
    public subscribe(event_type: typeof AbstractEvent, handler: Function):      void {throw new Error('abstract')}
    public unsubscribe(event_type: typeof AbstractEvent, handler: Function):    void {throw new Error('abstract')}
    public emit(event: AbstractEvent):                                          void {throw new Error('abstract')}
}