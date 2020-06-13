import Presenter from "../../base/Presenter";
import {View} from "../../base/View";
import Application from "../../Application";
import IEventService from "../../services/interfaces/IEventService";

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
        this.presenters = [];

        // unsubscribe from events

        for (const presenter_type of this.presenter_types) {
            this.presenters.push(new presenter_type(view));
        }

        // subscribe for events
    }
}