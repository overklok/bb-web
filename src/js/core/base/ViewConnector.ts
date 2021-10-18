import IEventService, {EventHandlingError} from "../services/interfaces/IEventService";
import IModelService from "../services/interfaces/IModelService";
import Presenter from "./Presenter";
import {AbstractEvent, Action, GenericErrorEvent, ViewEvent} from "./Event";
import {IViewProps, View} from "./view/View";
import {PresenterType} from "../helpers/types";
import IRoutingService from "../services/interfaces/IRoutingService";

/**
 * Communicates single {@link View} with the logical layer of application
 * in the face of Presenter objects
 * 
 * Aggregates Presenter requests to update props of the View.
 *
 * For {@link Presenter}, {@link ViewConnector} provides an interface
 * to extract Model instances using {@link IModelService}.
 * For both {@link View} and {@link Presenter} to emit events using {@link IEventService}.
 *
 * Although Views can be constructed and destructed multiple times in a single Application lifetime,
 * {@link ViewConnector} is persistent. Each time ViewService needs to construct the View, it should provide a View instance
 * by calling {@link attach} method in any way available to View.
 * {@link ViewConnector}, in the meanwhile, will give an access to View instance for Presenters connected to it.
 *
 * {@link ViewConnector} may be available for any part of {@link ViewService} machinery
 * including some of React components that used in {@link LayoutView}
 */
export default class ViewConnector {
    /** An instance of View that is available directly to Presenters */
    public view: View<any, any>;
    /** An instance of EventService that is used to pass events from Presenters or the View */
    private readonly svc_event: IEventService;
    /** An instance of ModelService that is used to extract Model instances for Presenters */
    private readonly svc_model: IModelService;
    /** An instance of RoutingService if Router needed in application */
    private readonly svc_routing: IRoutingService;

    /** Handler keys that kept here to unsubscribe in the future (i.e. in case of re-attaching the View) */
    private handlers: [typeof AbstractEvent, Function][] = [];

    /** An array of presenter prototypes to construct Presenter instances when the View is attached */
    public readonly presenter_types: PresenterType<View>[];

    /** An array of {@link Action} bindings - the title, an Action type */
    public actions: [string, Action<any>, Function][] = [];

    private presenters: Presenter<any>[];

    private props_deferred: IViewProps;
    private on_props_cb: (props: IViewProps) => void;

    /**
     * View connectors are usually built by ViewService at the registration of Widget
     * and stays permanent throughout the entire lifecycle of application.
     *
     * @param svc_event
     * @param svc_model
     * @param presenter_types
     * @param svc_routing
     */
    constructor(presenter_types: PresenterType<View>[],
                svc_event: IEventService,
                svc_model: IModelService,
                svc_routing?: IRoutingService,
    ) {
        // Get instances of required services
        this.svc_event = svc_event;
        this.svc_model = svc_model;
        this.svc_routing = svc_routing;

        this.presenter_types = presenter_types;

        // Activate presenter action bindings
        this.activateActionBindings();
    }

    /**
     * Collect initial props from all of the presenters collected in the {@link ViewConnector}.
     * 
     * All props from the presenters will be merged and re-written in the order 
     * of presentation in the {@link Widget} definition.
     * 
     * @returns 
     */
    collectProps(): IViewProps {
        let props = {};

        this.presenters = [];

        for (const presenter_type of this.presenter_types) {
            let presenter: Presenter<View>;

            presenter = new presenter_type(this.svc_model, this.svc_routing);
            const local_props = presenter.getInitialProps();
            presenter.onPropsUpdate(this.setViewProps.bind(this));

            if (local_props) {
                props = {...props, ...local_props};
            }

            this.presenters.push(presenter);
        }

        return props;
    }

    /**
     * Request to update {@link View} properties.
     * 
     * If the {@link View} is not yet ready to accept prop updates, defer it before it passes
     * the prop update callback via {@link onPropsUpdate} method.
     * 
     * @param props 
     */
    setViewProps(props: IViewProps) {
        if (this.on_props_cb) {
            // pass the props if the View's parent component is ready to update it
            this.on_props_cb(props);
        } else {
            // create or update existing deferred props to pass 
            // until `on_props_cb` will be defined
            if (this.props_deferred) {
                this.props_deferred = {...props, ...this.props_deferred};
            } else {
                this.props_deferred = {...props};
            }
        }
    }

    /**
     * Attach a {@link View} instance created by the {@link ViewService}.
     * The instance will be available for {@link Presenter} instances.
     * 
     * The {@link View} will be propagated to all of the presenters collected in the object.
     * All presenter' event handlers would be subscribed to its events.
     *
     * React-based {@link View} components can call this procedure at any time
     * in no particular order.
     * Consider the call of this function as a random event to avoid errors related
     * with out-of-order object state changes. 
     * 
     * @param view the {@link View} created by React
     */
    attach(view: View) {
        // if (this.view) {
        //     this.detach();
        // }

        // console.log('attach', view.constructor.name);

        // Assign or reassign the view proposed
        this.view = view;

        // To prevent duplicated (further) subscriptions, unsubscribe current handlers
        this.unsubscribePresenterHandlers();

        for (const presenter of this.presenters) {
            presenter.attachView(view);
            this.subscribePresenterHandlers(presenter);
        }
    }

    /**
     * @deprecated
     */
    detach() {
        // this.unsubscribePresenterHandlers();

        // delete this.view;
    }

    /**
     * Emits event by the {@link View} or by one of {@link Presenter} instances (i.e. Actions)
     *
     * @param event the event to be passed
     */
    emit<E>(event: ViewEvent<E>) {
        const anchor = this.getEventAnchorByInstance(event);

        return this.svc_event.emitAsync(event, anchor);
    }

    /**
     * Resizes the View attached to the connector
     */
    resizeView() {
        if (this.view) {
            this.view.resize();
        }
    }

    /**
     * Attach a callback function to call when on of the related {@link Presenter}s will request
     * prop changes for the {@link View} attached.
     * 
     * This requires that the parent component of the {@link View} is ready to update the props of its children.
     * For React-based {@link View}s, this is the moment when `componentDidMount` has been called for the parent component. 
     * 
     * @param cb 
     */
    onPropsUpdate(cb: (props: IViewProps) => void) {
        // Attach the callback
        this.on_props_cb = cb;

        // If there are props set earlier, immediately pass the to the View
        if (this.props_deferred) {
            this.setViewProps(this.props_deferred);
            this.props_deferred = undefined;
        }
    }

    /**
     * Activate {@link Action} bindings to existing Presenter types
     *
     * Presenters can declare a number of Action types.
     * From the ViewService side, some UI can be provided to call this actions, and
     * by calling this method {@link ViewConnector} makes available to pass an action back to Presenter that declared it.
     *
     * For example, {@link LayoutView} can display a widget-specific menu that lists all of the actions declared
     * by Providers in the {@link Widget}.
     */
    private activateActionBindings() {
        for (const presenter_type of this.presenter_types) {
            if (this.actions.length > 0) {
                this.actions.push([null, null, null]);
            }

            const action_types = (presenter_type as any)["actions"];

            if (action_types) {
                for (const [action_type, action_name] of action_types.entries()) {
                    if (action_type == null) continue;

                    this.actions.push([action_name, action_type, () => {
                        this.emit(new action_type());
                    }]);
                }
            }
        }
    }

    private async subscribePresenterHandlers(presenter: Presenter<any>) {
        for (const [method_name, preset] of presenter.presets.entries()) {
            for (const {event_type, restorable} of preset) {
                const anchor = this.getEventAnchorByType(event_type);

                const svc_event = this.svc_event;

                const presenter_method_handler = function () {
                    try {
                        return (presenter as any)[method_name](...arguments);
                    } catch (e) {
                        console.error(
                            `Error occurred when tried to run ${presenter.constructor.name}.${method_name} ` +
                            `to handle '${event_type.name}':\n`, e
                        );

                        svc_event.emitAsync(new GenericErrorEvent({error: e}));
                    }
                };

                try {
                    await this.svc_event.subscribe(event_type, presenter_method_handler, anchor, restorable);
                } catch (e) {
                    if (e instanceof EventHandlingError) {
                        for (const suberror of e.suberrors) {
                            console.error(
                                `Error occurred when tried to subscribe ${presenter.constructor.name}.${method_name} ` +
                                `to ${event_type.name}:\n`, suberror
                            );

                            await svc_event.emitAsync(new GenericErrorEvent({error: suberror}));
                        }
                    } else {
                        throw e;
                    }
                }

                this.handlers.push([event_type, presenter_method_handler]);
            }
        }
    }

    /**
     * Clear all the handlers from the {@link EventService} to keep state clean
     */
    private unsubscribePresenterHandlers() {
       // this.svc_event.resetObject(this);
       for (const [evt_type, hdlr] of this.handlers) {
           const anchor = this.getEventAnchorByType(evt_type);

           this.svc_event.unsubscribe(evt_type, hdlr, anchor);
       }

       this.handlers = [];
    }

    /**
     * Define appropriate anchor to use when emitting events
     *
     * Emitting is possible only by attached View, so View should emit only to presenter attached to this connector.
     * If needed to emit another types of events, it should be possible to listen to globally,
     * so in this case use (null).
     *
     * @param evt_type
     */
    private getEventAnchorByInstance<E extends AbstractEvent<any>>(evt_type: E): any {
        // use 'this' if event is derived from ViewEvent
        return ((evt_type as any).__proto__ instanceof ViewEvent || (evt_type as any) === ViewEvent) ? this : null;
    }

    /**
     * Define appropriate anchor to use when subscribing to events
     *
     * When presenter subscribes, it have to listen to its View events only, so in this case we need to
     * isolate events to (this). But presenter still can listen to models' events that emits globally so here this
     * function returns (null).
     *
     * @param evt_type
     */
    private getEventAnchorByType(evt_type: typeof AbstractEvent): any {
        // use 'this' if event is derived from ViewEvent
        return (evt_type.prototype instanceof ViewEvent || evt_type === ViewEvent) ? this : this;
    }
}