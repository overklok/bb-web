import {IViewProps, IViewState, View} from "./view/View";
import {AbstractEvent, Action} from "./Event";
import IModelService from "../services/interfaces/IModelService";
import Model, {ModelConstructor} from "./model/Model";
import DataSource from "./model/DataSource";

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

export function action<A extends Action<A>>(action_type: A) {
    return on(action_type);
}

export default class Presenter<V extends View<IViewProps, IViewState>> {
    protected static actions: Map<Action<any>, string> = new Map();
    public readonly routes: Map<AbstractEvent<any>, string>;

    protected view: V;
    private svc_model: IModelService;

    constructor(view: V, svc_model: IModelService) {
        if (this.routes == null) {this.routes = new Map();}

        this.view = view;
        this.svc_model = svc_model;

        this.ready();
    };

    protected ready() {

    }

    protected getModel<DS extends DataSource, M extends ModelConstructor<DS>>(model_type: M): InstanceType<M> {
        return this.svc_model.retrieve(model_type);
    }
}