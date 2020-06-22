import Presenter from "./Presenter";
import {IViewProps, IViewState, View} from "./View";
import Application from "../Application";
import IEventService from "../services/interfaces/IEventService";
import {AbstractEvent, Action, ViewEvent} from "./Event";

// possible renamings: Supervisor, PresenterFactory (pterfac)
export default class ViewConnector {
    private readonly app: Application;
    private readonly svc_event: IEventService;
    // private presenters: Presenter<View<IViewProps, IViewState>>[];

    public readonly presenter_types: typeof Presenter[];
    public actions: Array<[string, Action<any>, Function]> = [];

    constructor(app: Application, presenter_types: typeof Presenter[]) {
        this.app = app;

        this.svc_event = this.app.instance(IEventService);

        this.presenter_types = presenter_types;
        // this.presenters = [];

        // Activate presenter action bindings
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

    activate(view: View<IViewProps, IViewState>) {
        this.unsubscribeCurrentPresenters();

        // this.presenters = [];
        for (const presenter_type of this.presenter_types) {
            const presenter = new presenter_type(view);
            // this.presenters.push(presenter);

            // Activate presenter routes
            for (const [evt_type, prop_handler] of presenter.routes.entries()) {
                const hdlr = function() {(presenter as any)[prop_handler](...arguments)};
                this.svc_event.subscribe(evt_type, hdlr, this);
            }
        }
    }

    emit<E>(event: AbstractEvent<E>) {
        this.svc_event.emit(event, this);
    }

    private unsubscribeCurrentPresenters() {
        this.svc_event.resetObject(this);
    }
}