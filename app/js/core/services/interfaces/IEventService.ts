/**
 * @abstract
 */
export default class IEventService {
    public subscribe(event_type: typeof Event, handler: Function): void {throw new Error('abstract')}
    public emit(event_type: typeof Event): void {throw new Error('abstract')}
}