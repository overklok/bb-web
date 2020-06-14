import {View} from "./View";
import {AbstractEvent} from "./Event";

export function on(event: AbstractEvent) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.routes == null) {
            target.routes = new Map();
        }

        target.routes.set(event, target[propertyKey])

        return target;
    }
}

export default class Presenter {
    public static viewtype: typeof View;

    public readonly routes: Map<typeof AbstractEvent, Function>;

    constructor(view: View) {

    };
}