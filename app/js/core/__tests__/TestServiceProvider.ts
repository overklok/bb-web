import ServiceProvider from "../providers/ServiceProvider";
import Application from "../Application";
import IEventService from "../services/interfaces/IEventService";
import EventService from "../services/EventService";

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