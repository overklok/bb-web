import ServiceProvider from "./ServiceProvider";
import Application from "../Application";
import IConfigService from "../services/interfaces/IConfigService";
import ConfigService from "../services/ConfigService";

export default class ConfigServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IConfigService, function (app: Application): any {
            return new ConfigService();
        });
    }
}