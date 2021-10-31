import {ServiceProvider} from "./ServiceProvider";
import Application from "../Application";
import IViewService from "../services/interfaces/IViewService";
import ViewService from "../services/ViewService";

/**
 * @category Core
 * @subcategory Service
 */
export default class ViewServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IViewService, function (app: Application): any {
            return new ViewService(app);
        });
    }

    public boot() {
        this.app.instance(IViewService).setup();
    }
}