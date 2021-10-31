import IRoutingService from "./interfaces/IRoutingService";
import Router, {IRouter, Route} from "../base/Router";
import IModelService from "./interfaces/IModelService";
import IEventService from "./interfaces/IEventService";
import {GenericErrorEvent} from "../base/Event";

/**
 * @category Core
 * @subcategory Service
 */
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
            this.redirect(document.location.pathname);
        });
    }

    async forward(route_name: string, params: any[], override: boolean = false) {
        const path = this.router.reverse(route_name, params);
        const search = document.location.search;

        if (window.location.pathname !== path) {
            if (override) {
                window.history.replaceState({route_name, params}, 'nothing', path + search);
            } else {
                window.history.pushState({route_name, params}, 'nothing', path + search);
            }
        }

        await this.redirect(path);
    }

    private async redirect(path: string) {
        try {
            return await this.router.redirect(path);
        } catch (e) {
            console.error(e);
            await this.svc_event.emitAsync(new GenericErrorEvent({error: e}));
        }
    }
}