import IEventService from "./interfaces/IEventService";

export default class EventService extends IEventService {
    private handlers: Map<typeof Event, Function[]>;

    subscribe(event_type: typeof Event, handler: Function) {
        let handlers = this.handlers.get(event_type)

        if (handlers == null) {
            handlers = [];
            this.handlers.set(event_type, handlers);
        }

        handlers.push(handler);
    }

    unsubscribe(event_type: typeof Event) {
        this.handlers.set(event_type, []);
    }

    emit(event_type: typeof Event) {
        const handlers = this.handlers.get(event_type) || [];

        for (const handler of handlers) {
            // handlers();
        }
    }
}