import Presenter from "../base/Presenter";
import {IViewProps, IViewState, View} from "../base/View";
import Application from "../Application";
import IEventService from "../services/interfaces/IEventService";
import {AbstractEvent, ViewEvent} from "../base/Event";

// possible renamings: Supervisor, PresenterFactory (pterfac)
export default class ViewConnector {
    private readonly app: Application;
    private readonly presenter_types: typeof Presenter[];
    private readonly svc_event: IEventService;
    private presenters: Presenter<View<IViewProps, IViewState>>[];

    private on_activation: Function;

    constructor(app: Application) {
        this.app = app;

        this.presenter_types = [];
        this.presenters = [];
        this.svc_event = this.app.instance(IEventService);
    }

    addPresenter(presenter_type: typeof Presenter) {
        this.presenter_types.push(presenter_type);
    }

    activate(view: View<IViewProps, IViewState>) {
        this.unsubscribeCurrentPresenters();

        this.presenters = [];
        for (const presenter_type of this.presenter_types) {

            const presenter = new presenter_type(view);
            this.presenters.push(presenter);

            for (const [evt_type, prop_handler] of presenter.routes.entries()) {
                const hdlr = function() {(presenter as any)[prop_handler](...arguments)};
                this.svc_event.subscribe(evt_type, hdlr, this);
            }
        }

        if (this.on_activation) {
            this.on_activation(view);
        }
    }

    emit<E>(event: ViewEvent<E>) {
        this.svc_event.emit(event, this);
    }

    onActivation(cb: Function) {
        this.on_activation = cb;
    }

    private unsubscribeCurrentPresenters() {
        this.svc_event.resetObject(this);

        // for (const presenter of this.presenters) {
        //     for (const [evt_type, prop_handler] of presenter.routes.entries()) {
        //         this.svc_event.reset(evt_type, this);
        //     }
        // }
    }
}