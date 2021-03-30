import {View, ViewPropsOf} from "./view/View";
import {AbstractEvent, Action} from "./Event";
import IModelService from "../services/interfaces/IModelService";
import {ModelConstructor, ModelState} from "./model/Model";
import Datasource from "./model/Datasource";
import IRoutingService from "../services/interfaces/IRoutingService";
import RoutingService from "../services/RoutingService";
import ModalPresenter from "../presenters/ModalPresenter";

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
        // TODO: Fix inheritance issue:
        //       we usually don't want to combine base and derived classes to make both handlers working,
        //       but we need to do it because of this

        if (Object.getOwnPropertyDescriptor(target, 'presets') == null) {
            target.presets = new Map();
        }

        // If we will do THIS instead of the code above, we will have troubles with using base and derived classes
        // simultaneously because of duplicating event handlers and sometimes missing event handlers

        // if (target.presets == null) {
        //     target.presets = new Map();
        // }

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

            // TODO: Prevent preset creation for inheritors

            // if (target.constructor.presets && target.constructor.presets[propertyKey] === target.presets[propertyKey]) {
            //     continue;
            // }

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
export default class Presenter<V extends View> implements Subscriptable {
    // Map method name to subscription preset
    public readonly presets: Map<string, SubscriptionPreset[]>;

    protected view: V;
    private svc_model: IModelService;
    private readonly svc_routing: IRoutingService;
    private on_props_cb: (props: Partial<ViewPropsOf<V>>) => void;

    /**
     * Create a Presenter.
     *
     * @param svc_model   an instance of model service
     * @param svc_routing      an instance of Router, if used
     */
    constructor(svc_model: IModelService, svc_routing?: RoutingService) {
        if (this.presets == null) {this.presets = new Map();}

        this.svc_model = svc_model;
        this.svc_routing = svc_routing;
    };

    /**
     * Prepare Presenter to use in application workflow.
     */
    public getInitialProps(): ViewPropsOf<V> | any {}

    public attachView(view: V) {
        this.view = view;
    }

    public onPropsUpdate(cb: (props: ViewPropsOf<V>) => void) {
        this.on_props_cb = cb;
    }

    protected setViewProps(props: Partial<ViewPropsOf<V>>) {
        this.on_props_cb && this.on_props_cb(props);
    }

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
            throw new Error(`Model ${model_type.name} does not exist. Did you forgot to register it?`);
        }

        return model;
    }

    protected forward(route_name: string, params: any[] = [], override: boolean = false) {
        if (!this.svc_routing) {
            throw new Error("No router is available for the application");
        }

        return this.svc_routing.forward(route_name, params, override);
    }
}