import IEventService from "../services/interfaces/IEventService";
import Application from "../Application";
import EventService from "../services/EventService";
import ServiceProvider from "./ServiceProvider";

export default class TestServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IEventService, function (app: Application): any {
            return new EventService();
        });
    }
}