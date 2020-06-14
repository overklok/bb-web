import IEventService from "./interfaces/IEventService";
import {AbstractEvent} from "../base/Event";

export default class EventService extends IEventService {
    private handlers: {[key: string]: Function[]} = {};

    subscribe(event_type: typeof AbstractEvent, handler: Function) {
        console.log(this.handlers, event_type.name)

        let handlers = this.handlers[event_type.name]

        if (handlers == null) {
            handlers = [];

            this.handlers[event_type.name] = handlers;
        }

        handlers.push(handler);
    }

    reset(event_type: typeof AbstractEvent) {
        this.handlers[event_type.name] = [];
    }

    unsubscribe(event_type: typeof AbstractEvent, handler: Function) {
        this.handlers[event_type.name] = this.handlers[event_type.name].filter((hdlr: Function) => hdlr != handler);
    }

    emit(event: AbstractEvent) {
        const handlers = this.handlers[event.constructor.name] || [];

        for (const handler of handlers) {
            handler(event);
        }
    }
}