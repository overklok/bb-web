import Application from "../../Application";
import IEventService from "../../services/interfaces/IEventService";
import IModelService from "../../services/interfaces/IModelService";
import Presenter from "../Presenter";
import {AbstractEvent, Action, ModelEvent, ViewEvent} from "../Event";
import {IViewOptions, IViewState, View} from "./View";
import {PresenterType} from "../../helpers/types";

/**
 * ViewConnector is a class that makes possible to Views be communicated with logical layer of application
 * in the face of Presenter objects.
 *
 * For {@link Presenter}, {@link ViewConnector} provides an interface
 * to extract Model instances using {@link IModelService}.
 * For both {@link View} and {@link Presenter} to emit events using {@link IEventService}.
 *
 * Although Views can be constructed and destructed multiple times in a single Application lifetime,
 * ViewConnector is persistent. Each time ViewService needs to construct the View, it should provide a View instance
 * by calling {@link attach} method in any way available to View.
 * ViewConnector, in the meanwhile, will give an access to View instance for Presenters connected to it.
 *
 * ViewConnector may be available for any part of {@link ViewService} machinery
 * including some of React components that used in {@link LayoutView}
 */
export default class ViewConnector {
    /** @property An instance of View that is available directly to Presenters */
    public view: View<any, any>;
    /** @property An instance of EventService that is used to pass events from Presenters or the View */
    private readonly svc_event: IEventService;
    /** @property An instance of ModelService that is used to extract Model instances for Presenters */
    private readonly svc_model: IModelService;

    /** @property Handler keys that kept here to unsubscribe in the future (i.e. in case of re-attaching the View) */
    private handler_keys: [typeof AbstractEvent, number][] = [];

    /** @property An array of presenter prototypes to construct Presenter instances when the View is attached */
    public readonly presenter_types: PresenterType<View<IViewOptions, IViewState>>[];

    /** @property An array of {@link Action} bindings - the title, an Action type */
    public actions: Array<[string, Action<any>, Function]> = [];

    /**
     * View connectors are usually built by ViewService at the registration of Widget
     * and stays permanent throughout the entire lifecycle of application.
     *
     * @param app
     * @param presenter_types
     */
    constructor(app: Application, presenter_types: PresenterType<View<IViewOptions, IViewState>>[]) {
        // Get an instances of services needed
        this.svc_event = app.instance(IEventService);
        this.svc_model = app.instance(IModelService);

        this.presenter_types = presenter_types;

        // Activate presenter action bindings
        this.activateActionBindings();
    }

    /**
     * Attach a {@link View} instance that is created by the {@link ViewService}.
     * The instance will be available for {@link Presenter} instances.
     *
     * @param view
     */
    attach(view: View<IViewOptions, IViewState>) {
        this.view = view;

        this.unsubscribePresenterHandlers();

        // this.presenters = [];
        for (const presenter_type of this.presenter_types) {
            let presenter: Presenter<View<IViewOptions, IViewState>>;

            // try {
                presenter = new presenter_type(view, this.svc_model);
            // } catch (e) {
                // TODO: PresenterError
                // throw Error("Uncaught PresenterError [TODO]");
            // }
            // this.presenters.push(presenter);

            // Activate presenter routes
            this.subscribePresenterHandlers(presenter);
        }
    }

    detach() {
        delete this.view;

        this.unsubscribePresenterHandlers();
    }

    /**
     * Emit an event by the {@link View} or by one of {@link Presenter} instances (i.e. Actions)
     *
     * @param event the event to be passed
     */
    emit<E>(event: ViewEvent<E>) {
        const anchor = this.getEventAnchorByInstance(event);

        this.svc_event.emit(event, anchor);
    }

    /**
     * Resize the View attached to the connector
     */
    resizeView() {
        if (this.view) {
            this.view.resize();
        }
    }

    /**
     * Activate {@link Action} bindings to existing Presenter types
     *
     * Presenters can declare a number of Action types.
     * From the ViewService side, some UI can be provided to call this actions, and
     * by calling this method ViewConnector makes available to pass an action back to Presenter that declared it.
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

    private subscribePresenterHandlers(presenter: Presenter<any>) {
        for (const [evt_type, prop_handler] of presenter.routes.entries()) {
            const anchor = this.getEventAnchorByType(evt_type);

            const hdlr = function() {(presenter as any)[prop_handler](...arguments)};
            const hdlr_key = this.svc_event.subscribe(evt_type, hdlr, anchor);

            this.handler_keys.push([evt_type, hdlr_key]);
        }
    }

    /**
     * Clear all the handlers from the {@link EventService} to keep state clean
     */
    private unsubscribePresenterHandlers() {
       // this.svc_event.resetObject(this);
       for (const [evt_type, hdlr_key] of this.handler_keys) {
           const anchor = this.getEventAnchorByType(evt_type);

           this.svc_event.unsubscribe(evt_type, hdlr_key, anchor);
       }

       this.handler_keys = [];
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
        return (evt_type.prototype instanceof ViewEvent || evt_type === ViewEvent) ? this : null;
    }
}