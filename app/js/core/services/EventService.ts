import IEventService from "./interfaces/IEventService";

export default class EventService extends IEventService {
    private handlers: Map<typeof Event, []>;

    subscribe(event_type: typeof Event, handler: Function) {


    }

    emit(event: Event) {

    }
}