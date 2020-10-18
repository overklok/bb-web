import IRoutingService from "./interfaces/IRoutingService";
import Router, {IRouter} from "../base/Router";
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

    launch() {
        if (!this.router) {
            return;
        }
        const path = "/";
        this.router.launch();
        this.router.redirect(path);
    }
}