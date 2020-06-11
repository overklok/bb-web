import Event from "./Event";

export function on(event: Event) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.routes == null) {
            target.routes = new Map();
        }

        target.routes.set(event, target)

        return target;
    }
}

export default abstract class Presenter {
    private routes: Map<Event, Function>;
    constructor() {
    }
}