import ServiceProvider from "../support/ServiceProvider";
import Application from "../Application";
import IViewService from "../services/interfaces/IViewService";
import ViewService from "../services/ViewService";
import IConfigService from "../services/interfaces/IConfigService";
import {LayoutConfig} from "../configs/LayoutConfig";
import {ViewConfig} from "../configs/ViewConfig";

export default class ViewServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IViewService, function (app: Application): any {
            return new ViewService(app);
        });
    }

    public boot() {
        const config_service = this.app.instance(IConfigService);
        const config_views = config_service.configuration(ViewConfig);
        const config_layout = config_service.configuration(LayoutConfig);

        this.app.instance(IViewService).setup(config_layout, config_views);
    }
}