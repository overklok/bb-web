import {ServiceProvider} from "./ServiceProvider";
import IEventService from "../services/interfaces/IEventService";
import Application from "../Application";
import EventService from "../services/EventService";

export default class EventServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IEventService, function (app: Application): any {
            return new EventService();
        });
    }
}