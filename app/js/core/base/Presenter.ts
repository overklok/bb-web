import {View} from "./View";
import {AbstractEvent} from "./Event";

export function on<V extends AbstractEvent<V>>(event_type: V) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.routes == null) {
            target.routes = new Map();
        }

        target.routes.set(event_type, target[propertyKey])

        return target;
    }
}

export default class Presenter {
    public static viewtype: typeof View;
    public readonly routes: Map<AbstractEvent<any>, Function>;

    constructor(view: View) {

    };
}