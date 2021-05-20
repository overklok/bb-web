import IEventService, {EventHandlingError} from "./interfaces/IEventService";
import {AbstractEvent} from "../base/Event";

type HandlerPool = Map<any, Map<typeof AbstractEvent, Set<Function>>>;


/**
 * An implementation of IEventService based on Map and Set.
 *
 * @inheritDoc
 */
export default class EventService extends IEventService {
    private handler_pool: HandlerPool = new Map();
    private last_events: Map<typeof AbstractEvent, AbstractEvent<any>> = new Map();

    /**
     * @inheritDoc
     */
    async subscribe(
        event_type: typeof AbstractEvent,
        handler: Function,
        anchor: any = null,
        emit_last = false
    ): Promise<number> {
        if (anchor != null) {
            await this.subscribe(event_type, handler, null, false);
        }

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
                await this.emitAsync(last_event, anchor);
            }
        }

        return handlers.size;
    }

    /**
     * @inheritDoc
     */
    reset(event_type: typeof AbstractEvent, anchor: any = null) {
        let map = this.handler_pool.get(anchor);
        if (!map) return;

        if (anchor != null) {
            const handlers = map.get(event_type);

            for (const handler of handlers.values()) {
                this.unsubscribe(event_type, handler, null);
            }
        }

        map.set(event_type, null);

    }

    /**
     * @inheritDoc
     */
    resetObject(obj: any = null) {
        let map = this.handler_pool.get(obj);
        if (!map) return;

        if (obj != null) {
            for (const [event_type, handlers] of map.entries()) {
                if (!handlers) continue;

                for (const handler of handlers.values()) {
                    this.unsubscribe(event_type, handler, null);
                }
            }
        }

        this.handler_pool.set(obj, null);
    }

    /**
     * @inheritDoc
     */
    unsubscribe(event_type: typeof AbstractEvent, handler: Function, anchor: any = null) {
        if (anchor != null) {
            this.unsubscribe(event_type, handler, null);
        }

        let subpool = this.handler_pool.get(anchor);
        if (subpool == null) return;

        let handlers = subpool.get(event_type);

        handlers.delete(handler);
    }

    /**
     * @inheritDoc
     */
    async emitAsync<E extends AbstractEvent<E>>(event: E, anchor: any = null) {
        const event_type: typeof AbstractEvent = (event as any).__proto__.constructor;

        this.last_events.set(event_type, event);

        let map = this.handler_pool.get(anchor);

        if (map == null) return;

        let calls = [];

        // get prototype for class of this event, constructor of this prototype is event's class
        let proto = (event as any).__proto__;

        do {
            // get class of the prototype
            const evt_class = proto.constructor;

            const handlers_for_class = map.get(evt_class);

            if (handlers_for_class) {
                for (const handler of handlers_for_class) {
                    if (!handler) continue;
                    calls.push(handler(event));
                }
            }

            // prototype is now a prototype of parent class
            proto = proto.__proto__;
        } while (proto.constructor !== AbstractEvent)

        const promises = await Promise.allSettled(calls);

        const errors = promises.filter(
            (result: PromiseSettledResult<any>) => result.status === 'rejected'
        ).map(
            (result: PromiseRejectedResult) => result.reason
        );

        if (errors.length > 0) {
            throw new EventHandlingError('Some handlers are failed', errors);
        }
    }

    emit<E extends AbstractEvent<E>>(event: E, anchor: any = null) {
        this.emitAsync(event, anchor);
    }
}