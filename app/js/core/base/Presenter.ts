import {IViewProps, IViewState, View} from "./View";
import {AbstractEvent} from "./Event";

export function on<V extends AbstractEvent<V>>(...event_types: V[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.routes == null) {
            target.routes = new Map();
        }

        for (const event_type of event_types) {
            target.routes.set(event_type, propertyKey)
        }

        return target;
    }
}

export default class Presenter<V extends View<IViewProps, IViewState>> {
    public readonly routes: Map<AbstractEvent<any>, string>;
    protected view: V;

    constructor(view: V) {
        this.view = view;
    };
}