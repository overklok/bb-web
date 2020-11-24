import IRoutingService from "./interfaces/IRoutingService";
import Router, {IRouter, Route} from "../base/Router";
import IModelService from "./interfaces/IModelService";

export default class RoutingService extends IRoutingService {
    private router: Router<any>;
    private svc_model: IModelService;

    setup(svc_model: IModelService) {
        this.svc_model = svc_model;
    }

    setRouter(router_class: IRouter) {
        this.router = new router_class(this.svc_model);
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

    async forward(route_name: string, params: []) {
        const path = this.router.reverse(route_name, params);
        await this.router.redirect(path);

        window.history.pushState({route_name, params}, 'nothing', path);
    }
}