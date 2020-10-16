import IEventService from "./interfaces/IEventService";
import {AbstractEvent, ViewEvent} from "../base/Event";

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

        delete handlers[key];
    }

    emit<E extends AbstractEvent<E>>(event: E, anchor: any = null) {
        let map = this.handlers.get(anchor);

        if (map == null) return;

        let handlers = [];

        // get prototype for class of this event, constructor of this prototype is event's class
        let proto = (event as any).__proto__;

        do {
            // get class of the prototype
            const evt_class = proto.constructor;

            const handlers_for_class = map.get(evt_class);

            if (handlers_for_class) {
                handlers.push(...handlers_for_class);
            }

            // prototype is now a prototype of parent class
            proto = proto.__proto__;
        } while (proto.constructor !== AbstractEvent)

        for (const handler of handlers) {
            if (!handler) continue;
            handler(event);
        }
    }
}