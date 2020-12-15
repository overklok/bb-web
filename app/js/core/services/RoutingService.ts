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

        window.addEventListener('popstate', (e: PopStateEvent) => {
            this.router.redirect(document.location.pathname);
        });
    }

    async forward(route_name: string, params: any[], override: boolean = false) {
        const path = this.router.reverse(route_name, params);

        if (window.location.pathname !== path) {
            if (override) {
                window.history.replaceState({route_name, params}, 'nothing', path);
            } else {
                window.history.pushState({route_name, params}, 'nothing', path);
            }
        }

        await this.router.redirect(path);
    }
}