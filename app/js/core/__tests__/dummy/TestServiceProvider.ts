import ServiceProvider from "../../support/ServiceProvider";
import Application from "../../Application";
import IEventService from "../../service/interfaces/IEventService";
import EventService from "../../service/EventService";

export default class TestServiceProvider extends ServiceProvider {
    register() {
        this.app.bind('test', function (app: Application): any {
            return 'tester contains';
        });

        this.app.bind(IEventService, function (app: Application): any {
            return new EventService();
        });
    }
}