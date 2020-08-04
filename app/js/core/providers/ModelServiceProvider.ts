import ServiceProvider from "./ServiceProvider";
import Application from "../Application";
import IModelService from "../services/interfaces/IModelService";
import ModelService from "../services/ModelService";
import IEventService from "../services/interfaces/IEventService";

export default class ModelServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IModelService, function (app: Application): any {
            return new ModelService();
        });
    }

    boot() {
        this.app.instance(IModelService).setup(this.app.instance(IEventService));
    }
}