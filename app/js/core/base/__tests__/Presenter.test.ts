import Presenter, {on, restore} from "../Presenter";
import {View} from "../view/View";
import {ViewEvent} from "../Event";
import EventService from "../../services/EventService";

describe('@on decorator', () => {
    let event_svc: EventService;

    beforeEach(() => {
        event_svc = new EventService();
    })

    class FooEvent extends ViewEvent<FooEvent> {}
    class FooView extends View<any, any> {}

    it('routes simple ViewEvents to method of Presenter', () => {
        class FooPresenter extends Presenter<FooView> {
            @on(FooEvent)
            onFooEvent() {}
        }

        const fp = new FooPresenter(null, null);

        expect(fp.presets.has('onFooEvent')).toEqual(true);
        expect(fp.presets.get('onFooEvent')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    event_type: FooEvent,
                    restorable: false
                })
            ])
        );
    });

    it('routes restorable ViewEvents to method of Presenter', () => {
        class FooPresenter extends Presenter<FooView> {
            @restore() @on(FooEvent)
            onFooEvent() {}
        }

        const fp = new FooPresenter(null, null);

        expect(fp.presets.has('onFooEvent')).toEqual(true);
        expect(fp.presets.get('onFooEvent')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    event_type: FooEvent,
                    restorable: true
                })
            ])
        );
    });
});