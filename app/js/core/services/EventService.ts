import IEventService from "./interfaces/IEventService";
import {AbstractEvent} from "../base/Event";

type HandlerPool = Map<any, Map<typeof AbstractEvent, Set<Function>>>;

/**
 * An implementation of event service based on Map and Set
 */
export default class EventService extends IEventService {
    private handler_pool: HandlerPool = new Map();
    private last_events: Map<typeof AbstractEvent, AbstractEvent<any>> = new Map();

    subscribe(event_type: typeof AbstractEvent, handler: Function, anchor: any = null, emit_last = false): number {
        let subpool = this.handler_pool.get(anchor);

        if (subpool == null) {
            subpool = new Map();
            this.handler_pool.set(anchor, subpool);
        }

        let handlers = subpool.get(event_type);

        if (handlers == null) {
            handlers = new Set();

            subpool.set(event_type, handlers);
        }

        handlers.add(handler);

        if (emit_last && anchor) {
            const last_event = this.last_events.get(event_type);

            if (last_event) {
                this.emit(last_event, anchor);
            }
        }

        return handlers.size - 1;
    }

    reset(event_type: typeof AbstractEvent, anchor: any = null) {
        let map = this.handler_pool.get(anchor);
        map.set(event_type, null);
    }

    resetObject(obj: any = null) {
        this.handler_pool.set(obj, null);
    }

    unsubscribe(event_type: typeof AbstractEvent, handler: Function, anchor: any = null) {
        let subpool = this.handler_pool.get(anchor);

        if (subpool == null) return;

        let handlers = subpool.get(event_type);

        handlers.delete(handler);
    }

    emit<E extends AbstractEvent<E>>(event: E, anchor: any = null) {
        const event_type: typeof AbstractEvent = (event as any).__proto__.constructor;

        this.last_events.set(event_type, event);

        let map = this.handler_pool.get(anchor);

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