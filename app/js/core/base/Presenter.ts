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

export function action<V extends AbstractEvent<V>>(action_alias: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const tgt_action_names = target.constructor["actions"];

        if (target.constructor["action_bindings"] == null) {
            target.constructor["action_bindings"] = new Map();

            for (const alias of tgt_action_names.keys()) {
                target.constructor["action_bindings"].set(alias, null);
            }
        }

        const action_name = tgt_action_names.get(action_alias);

        target.constructor["action_bindings"].set(action_alias, [action_name, propertyKey]);

        return target;
    }
}

export default class Presenter<V extends View<IViewProps, IViewState>> {
    protected static actions: Map<string, string> = new Map();
    public static action_bindings: Map<string, [string, string]>;

    public readonly routes: Map<AbstractEvent<any>, string>;

    protected view: V;

    constructor(view: V) {
        if (this.routes == null) {this.routes = new Map();}

        this.view = view;
    };
}