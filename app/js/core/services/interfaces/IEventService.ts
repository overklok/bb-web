import {AbstractEvent} from "../../base/Event";

/**
 * @abstract
 */
export default class IEventService {
    subscribe(event_type: typeof AbstractEvent, handler: Function, anchor: any = null):                 number  {throw new Error('abstract')}
    public reset(event_type: typeof AbstractEvent, anchor: any = null):                        void    {throw new Error('abstract')}
    public resetObject(obj: any = null):                                                                void    {throw new Error('abstract')}
    public unsubscribe(event_type: typeof AbstractEvent, key: number, anchor: any = null):     void    {throw new Error('abstract')}
    emit<E extends AbstractEvent<E>>(event: E, anchor: any = null):                                     void    {throw new Error('abstract')}
}