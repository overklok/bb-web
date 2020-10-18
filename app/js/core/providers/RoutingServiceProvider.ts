import {ServiceProvider} from "./ServiceProvider";
import Application from "../Application";
import IModelService from "../services/interfaces/IModelService";
import IRoutingService from "../services/interfaces/IRoutingService";
import RoutingService from "../services/RoutingService";

export default class ModelServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IRoutingService, function (app: Application): any {
            return new RoutingService();
        });
    }

    setup() {
        this.app.instance(IRoutingService).setup(this.app.instance(IModelService));
    }

    boot() {
        this.app.instance(IRoutingService).launch();
    }
}