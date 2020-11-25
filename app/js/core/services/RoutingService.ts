import IRoutingService from "./interfaces/IRoutingService";
import Router, {IRouter, Route} from "../base/Router";
import IModelService from "./interfaces/IModelService";
import IEventService from "./interfaces/IEventService";

export default class RoutingService extends IRoutingService {
    private router: Router<any>;
    private svc_model: IModelService;
    private svc_event: IEventService;

    setup(svc_model: IModelService, svc_event: IEventService) {
        this.svc_model = svc_model;
        this.svc_event = svc_event;
    }

    setRouter(router_class: IRouter) {
        this.router = new router_class(this.svc_model, this.svc_event);
    }

    loadRoutes(routes: Route<any>[]) {
        this.router.addRoutes(routes);
    }

    async launch() {
        if (!this.router) {
            return;
        }

        this.router.launch();
        await this.router.redirect(window.location.pathname);
    }

    async forward(route_name: string, params: any[]) {
        const path = this.router.reverse(route_name, params);
        window.history.pushState({route_name, params}, 'nothing', path);
        await this.router.redirect(path);
    }
}