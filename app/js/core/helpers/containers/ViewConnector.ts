import Presenter from "../../base/Presenter";
import {View} from "../../base/View";
import Application from "../../Application";
import IEventService from "../../services/interfaces/IEventService";
import {ViewEvent} from "../../base/Event";

// possible renamings: Supervisor, PresenterFactory (pterfac)
export default class ViewConnector {
    private readonly app: Application;
    private readonly presenter_types: typeof Presenter[];
    private readonly svc_event: IEventService;
    private presenters: Presenter[];

    constructor(app: Application) {
        this.app = app;

        this.presenter_types = [];
        this.presenters = [];
        this.svc_event = this.app.instance(IEventService);
    }

    addPresenter(presenter_type: typeof Presenter) {
        this.presenter_types.push(presenter_type);
    }

    activate(view: View) {
        this.unsubscribeCurrentPresenters();

        this.presenters = [];

        for (const presenter_type of this.presenter_types) {
            const presenter = new presenter_type(view);

            this.presenters.push(presenter);

            for (const [evt_type, handler] of presenter.routes.entries()) {
                this.svc_event.subscribe(evt_type, handler, this);
            }
        }
    }

    emit<E>(event: ViewEvent<E>) {
        this.svc_event.emit(event, this);
    }

    private unsubscribeCurrentPresenters() {
        for (const presenter of this.presenters) {
            for (const [evt_type, handler] of presenter.routes.entries()) {
                this.svc_event.unsubscribe(evt_type, handler, this);
            }
        }
    }
}