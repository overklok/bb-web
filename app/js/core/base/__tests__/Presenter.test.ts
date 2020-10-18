import Presenter, {on, restore} from "../Presenter";
import {View} from "../view/View";
import {ViewEvent} from "../Event";
import EventService from "../../services/EventService";

describe('@on decorator', () => {
    let event_svc: EventService;

    beforeEach(() => {
        event_svc = new EventService();
    });

    class FooEvent extends ViewEvent<FooEvent> {}
    class BarEvent extends ViewEvent<BarEvent> {}
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

    it('routes multiple ViewEvents to the same method of Presenter', () => {
        class FooPresenter extends Presenter<FooView> {
            @on(FooEvent, BarEvent)
            onFooEvent() {}
        }

        const fp = new FooPresenter(null, null);

        expect(fp.presets.has('onFooEvent')).toEqual(true);
        expect(fp.presets.get('onFooEvent')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    event_type: FooEvent,
                }),
                expect.objectContaining({
                    event_type: BarEvent,
                })
            ])
        );
    });

    it('routes ViewEvent to multiple methods of Presenter', () => {
        class FooPresenter extends Presenter<FooView> {
            @on(FooEvent)
            onFooEvent() {}

            @on(FooEvent)
            onFooEvent2() {}
        }

        const fp = new FooPresenter(null, null);

        expect(fp.presets.has('onFooEvent')).toEqual(true);
        expect(fp.presets.has('onFooEvent2')).toEqual(true);
        expect(fp.presets.get('onFooEvent')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    event_type: FooEvent,
                }),
            ])
        );
        expect(fp.presets.get('onFooEvent2')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    event_type: FooEvent,
                }),
            ])
        );
    });

    it('routes duplicated ViewEvent to method of Presenter once', () => {
        class FooPresenter extends Presenter<FooView> {
            @restore() @on(FooEvent, FooEvent)
            onFooEvent() {}
        }

        const fp = new FooPresenter(null, null);

        expect(fp.presets.has('onFooEvent')).toEqual(true);
        expect(fp.presets.get('onFooEvent').length).toEqual(1);
        expect(fp.presets.get('onFooEvent')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    event_type: FooEvent,
                    restorable: true
                }),
            ])
        );
    });
});