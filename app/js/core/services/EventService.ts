import IEventService from "./interfaces/IEventService";
import {AbstractEvent} from "../base/Event";

export default class EventService extends IEventService {
    private handlers: Map<AbstractEvent<any>, Function[]> = new Map();

    subscribe<V extends AbstractEvent<V>>(event_type: V, handler: Function) {
        let handlers = this.handlers.get(event_type)

        if (handlers == null) {
            handlers = [];

            this.handlers.set(event_type, handlers);
        }

        handlers.push(handler);
    }

    reset<V extends AbstractEvent<V>>(event_type: V) {
        this.handlers.set(event_type, []);
    }

    unsubscribe<V extends AbstractEvent<V>>(event_type: V, handler: Function) {
        this.handlers.set(
            event_type,
            this.handlers.get(event_type).filter(
                (hdlr: Function) => hdlr != handler
            )
        );
    }

    emit<E>(event: AbstractEvent<E>) {
        const handlers = this.handlers.get(event.constructor) || [];

        for (const handler of handlers) {
            handler(event);
        }
    }
}