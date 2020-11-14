import Presenter, {on, restore} from "../Presenter";
import {View} from "../view/View";
import {ViewEvent} from "../Event";
import EventService from "../../services/EventService";
import ModelService from "../../services/ModelService";
import Model from "../model/Model";
import Datasource from "../model/Datasource";

describe('Presenter', () => {
    const call_mock = jest.fn();

    const fake_connector = {
        attach: () => {}
    };

    let model_svc: ModelService;

    class FooView extends View<any, any> {
        public callMockFunction() {
            call_mock();
        }
    }

    class FooModel extends Model<{}, Datasource> {
        protected defaultState: {};

        public callMockFunction() {
            call_mock();
        }
    }

    beforeEach(() => {
        model_svc = new ModelService();
        model_svc.register(FooModel, new class extends Datasource {});

        call_mock.mockClear();
    });

    it('can extract a Model instance from repository and call its method', () => {
        class FooPresenter extends Presenter<FooView> {
            public callModelMethod() {
                return this.getModel(FooModel).callMockFunction();
            }
        }

        const fp = new FooPresenter(null, model_svc);

        fp.callModelMethod();

        expect(call_mock).toBeCalledTimes(1);
    });

    it('can retrieve a View instance and call its method', () => {
        class FooPresenter extends Presenter<FooView> {
            public callViewMethod() {
                return this.view.callMockFunction();
            }
        }

        const fp = new FooPresenter(
            new FooView({nest_mounted: false, connector: fake_connector as any}),
            null
        );

        fp.callViewMethod();

        expect(call_mock).toBeCalledTimes(1);
    });
});

describe('@on decorator', () => {
    let event_svc: EventService;

    class FooEvent extends ViewEvent<FooEvent> {}
    class BarEvent extends ViewEvent<BarEvent> {}
    class FooView extends View<any, any> {}

    beforeEach(() => {
        event_svc = new EventService();
    });

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

    it('routes restorable ViewEvents to method of Presenter when defined in array format', () => {
        class FooPresenter extends Presenter<FooView> {
            @on([FooEvent, true])
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

    it('routes multiple restorable ViewEvents to the same method of Presenter', () => {
        class FooPresenter extends Presenter<FooView> {
            @restore() @on(FooEvent, BarEvent)
            onFooEvent() {}
        }

        const fp = new FooPresenter(null, null);

        expect(fp.presets.has('onFooEvent')).toEqual(true);
        expect(fp.presets.get('onFooEvent')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    event_type: FooEvent,
                    restorable: true
                }),
                expect.objectContaining({
                    event_type: BarEvent,
                    restorable: true
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