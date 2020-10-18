import {IViewOptions, IViewState, View} from "./view/View";
import {AbstractEvent, Action} from "./Event";
import IModelService from "../services/interfaces/IModelService";
import {ModelConstructor, ModelState} from "./model/Model";
import Datasource from "./model/Datasource";

type EventTypeParam = typeof AbstractEvent;
type RestorableEventTypeParam = [typeof AbstractEvent, boolean];

type SubscriptionPreset = {event_type: typeof AbstractEvent, restorable: boolean};

interface Subscriptable {
    presets: Map<string, SubscriptionPreset[]>;
}

/**
 * Decorator function applied to Presenter methods to subscribe them to events
 *
 * @param event_type_objs
 */
export function on(...event_type_objs: EventTypeParam[]|RestorableEventTypeParam[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.presets == null) {
            target.presets = new Map();
        }

        // Temporary storage to track down types and then to remove duplicates
        const types_added = [];

        for (const event_type_obj of event_type_objs) {
            let restorable = false;
            let event_type;

            if (Array.isArray(event_type_obj)) {
                event_type = event_type_obj[0];
                restorable = event_type_obj[1];
            } else {
                event_type = event_type_obj;
            }

            if (types_added.indexOf(event_type) !== -1) {
                continue;
            } else {
                types_added.push(event_type);
            }

            if (target.presets.has(propertyKey)) {
                target.presets.get(propertyKey).push({event_type, restorable});
            } else {
                target.presets.set(propertyKey, [{event_type, restorable}]);
            }
        }

        return target;
    }
}

export function restore(...event_types: typeof AbstractEvent[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.presets == null) {
            throw Error("The presenter does not have any methods that handle events");
        }

        if (!target.presets.has(propertyKey)) {
            throw Error(`There are no specified event types for method ${propertyKey}`);
        }

        const presets = target.presets.get(propertyKey);

        for (const preset of presets) {
            if (event_types.length) {
                if (event_types.indexOf(preset.event_type) > -1) {
                    preset.restorable = true;
                    break;
                }
            } else {
                preset.restorable = true;
            }
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
export default class Presenter<V extends View<IViewOptions, IViewState>> implements Subscriptable {
    // Map method name to subscription preset
    public readonly presets: Map<string, SubscriptionPreset[]>;

    protected view: V;
    private svc_model: IModelService;

    /**
     * Create a Presenter.
     *
     * @param view        an instance of some kind of View
     * @param svc_model   an instance of model service
     */
    constructor(view: V, svc_model: IModelService) {
        if (this.presets == null) {this.presets = new Map();}

        this.view = view;
        this.svc_model = svc_model;

        this.ready();
    };

    /**
     * Prepare Presenter to use in application workflow.
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
            throw new Error(`Model ${model_type.name} does not exists. Did you forgot to register it?`);
        }

        return model;
    }
}