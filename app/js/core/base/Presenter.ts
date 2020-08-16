import {IViewOptions, IViewState, View} from "./view/View";
import {AbstractEvent, Action} from "./Event";
import IModelService from "../services/interfaces/IModelService";
import {ModelConstructor, ModelState} from "./model/Model";
import Datasource from "./model/Datasource";

/**
 * Decorator function applied to Presenter methods to subscribe them to events
 *
 * @param event_types
 */
export function on(...event_types: typeof AbstractEvent[]) {
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

/**
 * Alternative to {@link on} function
 *
 * @param action_type
 */
export function action(action_type: typeof Action) {
    return on(action_type);
}

/**
 * An entity that acts upon the Model and the View.
 * It retrieves data from repositories (the Model), and formats it for display in the View.
 *
 * @see Model
 * @see View
 */
export default class Presenter<V extends View<IViewOptions, IViewState>> {
    public readonly routes: Map<typeof AbstractEvent, string>;

    protected view: V;
    private svc_model: IModelService;

    /**
     * Create a Presenter.
     *
     * @param view        an instance of some kind of View
     * @param svc_model   an instance of model service
     */
    constructor(view: V, svc_model: IModelService) {
        if (this.routes == null) {this.routes = new Map();}

        this.view = view;
        this.svc_model = svc_model;

        this.ready();
    };

    /**
     * Prepare Presenter for use in application workflow.
     */
    protected ready() {}

    /**
     * Retrieve an instance of the Model.
     *
     * @param model_type
     * @param suppress_errors
     */
    protected getModel<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>
        (model_type: M, suppress_errors: boolean = false): InstanceType<M>
    {
        const model = this.svc_model.retrieve(model_type);

        if (!model && !suppress_errors) {
            throw new Error(`Model ${model_type.name} does not exist.`);
        }

        return model;
    }
}