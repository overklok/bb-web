import IEventService from "./interfaces/IEventService";
import {AbstractEvent} from "../base/Event";

export default class EventService extends IEventService {
    private handlers: Map<any, Map<AbstractEvent<any>, Function[]>> = new Map();

    subscribe<V extends AbstractEvent<V>>(event_type: V, handler: Function, obj: any = null): number {
        let map = this.handlers.get(obj);

        if (map == null) {
            map = new Map();
            this.handlers.set(obj, map);
        }

        let handlers = map.get(event_type);

        if (handlers == null) {
            handlers = [];

            map.set(event_type, handlers);
        }

        return handlers.push(handler) - 1;
    }

    reset<V extends AbstractEvent<V>>(event_type: V, obj: any = null) {
        let map = this.handlers.get(obj);
        map.set(event_type, null);
    }

    resetObject(obj: any = null) {
        this.handlers.set(obj, null);
    }

    unsubscribe<V extends AbstractEvent<V>>(event_type: V, key: number, obj: any = null) {
        let map = this.handlers.get(obj);

        if (map == null) return;

        let handlers = map.get(event_type);

        if (key > handlers.length) {
            throw new Error("Invalid handler key has been passed to unsubscribe");
        }

        handlers.splice(key);
    }

    emit<E>(event: AbstractEvent<E>, obj: any = null) {
        let map = this.handlers.get(obj);

        if (map == null) return;

        const handlers = map.get(event.constructor) || [];

        for (const handler of handlers) {
            handler(event);
        }
    }
}