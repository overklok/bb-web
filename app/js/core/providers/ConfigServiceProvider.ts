import ServiceProvider from "../support/ServiceProvider";
import Application from "../Application";
import IConfigService from "../service/interfaces/IConfigService";
import ConfigService from "../service/ConfigService";

export default class ConfigServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IConfigService, function (app: Application): any {
            return new ConfigService();
        });
    }
}