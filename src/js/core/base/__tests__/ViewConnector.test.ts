import EventService from "../../services/EventService";
import ModelService from "../../services/ModelService";
import {ViewEvent} from "../Event";
import {View} from "../view/View";

class FooEvent extends ViewEvent<FooEvent> {}
class BarEvent extends ViewEvent<BarEvent> {}
class BazEvent extends ViewEvent<BazEvent> {}

class FooView extends View<any, any> {}

let event_svc: EventService,
    model_svc: ModelService;

// beforeEach(() => {
//     event_svc = new EventService();
//     model_svc = new ModelService();
// });
//
// test('', () => {
//     class FooPresenter extends Presenter<FooView> {
//         @on(FooEvent)
//         onFooEvent() {}
//     }
//
//     const vc = new ViewConnector(event_svc, model_svc, [FooPresenter]);
// });