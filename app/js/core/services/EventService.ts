import IEventService from "./interfaces/IEventService";
import {AbstractEvent} from "../base/Event";

export default class EventService extends IEventService {
    private handlers: Map<any, Map<typeof AbstractEvent, Function[]>> = new Map();

    subscribe(event_type: typeof AbstractEvent, handler: Function, anchor: any = null): number {
        let map = this.handlers.get(anchor);

        if (map == null) {
            map = new Map();
            this.handlers.set(anchor, map);
        }

        let handlers = map.get(event_type);

        if (handlers == null) {
            handlers = [];

            map.set(event_type, handlers);
        }

        return handlers.push(handler) - 1;
    }

    reset(event_type: typeof AbstractEvent, anchor: any = null) {
        let map = this.handlers.get(anchor);
        map.set(event_type, null);
    }

    resetObject(obj: any = null) {
        this.handlers.set(obj, null);
    }

    unsubscribe(event_type: typeof AbstractEvent, key: number, anchor: any = null) {
        let map = this.handlers.get(anchor);

        if (map == null) return;

        let handlers = map.get(event_type);

        if (key > handlers.length) {
            throw new Error("Invalid handler key has been passed to unsubscribe");
        }

        handlers.splice(key);
    }

    emit<E extends AbstractEvent<E>>(event: E, anchor: any = null) {
        let map = this.handlers.get(anchor);

        if (map == null) return;

        const handlers = map.get(Object.getPrototypeOf(event).constructor) || [];

        for (const handler of handlers) {
            handler(event);
        }
    }
}