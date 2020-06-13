import Event from "./Event";
import {View} from "./View";

export function on(event: Event) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.routes == null) {
            target.routes = new Map();
        }

        target.routes.set(event, target)

        return target;
    }
}

export default class Presenter {
    public static viewtype: typeof View;

    private routes: Map<Event, Function>;

    constructor(view: View) {

    };
}