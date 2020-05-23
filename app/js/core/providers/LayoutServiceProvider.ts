import ServiceProvider from "../support/ServiceProvider";
import Application from "../Application";
import ILayoutService from "../service/interfaces/ILayoutService";
import LayoutService from "../service/LayoutService";
import IConfigService from "../service/interfaces/IConfigService";
import {LayoutConfiguration} from "../configuration/LayoutConfiguration";
import {ViewConfiguration} from "../configuration/ViewConfiguration";

export default class LayoutServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(ILayoutService, function (app: Application): any {
            return new LayoutService();
        });
    }

    public boot() {
        const config_service = this.app.instance(IConfigService);
        const config_views = config_service.configuration(ViewConfiguration);
        const config_layout = config_service.configuration(LayoutConfiguration);

        this.app.instance(ILayoutService).setup(config_layout, config_views);
    }
}