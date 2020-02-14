import ServiceProvider from "../../support/ServiceProvider";
import Application from "../../Application";
import IEventService from "../../service/IEventService";
import RealEventService from "../../service/RealEventService";

export default class TestServiceProvider extends ServiceProvider {
    boot() {
        this.app.bind('test', function (app: Application): any {
            return 'tester contains';
        });

        this.app.bind(IEventService, function (app: Application): any {
            return new RealEventService();
        });
    }
}