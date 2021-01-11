import {AbstractEvent, ModelEvent} from "../../base/Event";
import EventService from "../EventService";

class FooEvent extends AbstractEvent<any> {}
class BarEvent extends AbstractEvent<any> {}

class SubBarEvent extends BarEvent {}
class SubSubBarEvent extends SubBarEvent {}

let event_svc: EventService;

const handler = jest.fn();
const anchor_local = {};

beforeEach(() => {
    event_svc = new EventService();
    handler.mockClear();
});

/**
 * =========== ANCHOR-BASED EVENT DISTRIBUTION ===========
 */

test('runs global-anchored handlers for globally-emitted events', () => {
    // handle globally
    event_svc.subscribe(FooEvent, handler);

    // emit globally
    event_svc.emitAsync(new FooEvent());

    expect(handler).toHaveBeenCalled();
});

test('runs local-anchored handlers for locally-emitted events', () => {
    // handle locally
    event_svc.subscribe(FooEvent, handler, anchor_local);

    // emit locally
    event_svc.emitAsync(new FooEvent(), anchor_local);

    expect(handler).toHaveBeenCalled();
});

test('does not run local-anchored handlers for globally-emitted events', () => {
    // handle locally
    event_svc.subscribe(FooEvent, handler, anchor_local);

    // emit globally
    event_svc.emitAsync(new FooEvent());

    expect(handler).toBeCalledTimes(0);
});

test('does not run global-anchored handlers for locally-emitted events', () => {
    // handle globally
    event_svc.subscribe(FooEvent, handler);

    // emit locally
    event_svc.emitAsync(new FooEvent(), anchor_local);

    expect(handler).toBeCalledTimes(0);
});

/**
 * =========== MULTIPLE SUBSCRIPTION BEHAVIOR ===========
 */

test('runs multiple handlers for the same event type', () => {
    const [handler1, handler2] = [jest.fn(), jest.fn()];

    event_svc.subscribe(FooEvent, handler1);
    event_svc.subscribe(FooEvent, handler2);

    event_svc.emitAsync(new FooEvent());

    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
});

test('runs handler once for a specific event even if subscribed multiple times', () => {
    // accidentally subscribed twice
    event_svc.subscribe(FooEvent, handler);
    event_svc.subscribe(FooEvent, handler);

    event_svc.emitAsync(new FooEvent());

    expect(handler).toBeCalledTimes(1);
});

test('runs handler same times as a number of events emitted', () => {
    // accidentally subscribed twice
    event_svc.subscribe(FooEvent, handler);
    event_svc.subscribe(BarEvent, handler);

    // it should react twice for the same event
    event_svc.emitAsync(new FooEvent());
    event_svc.emitAsync(new FooEvent());

    // and another time for another type of event
    event_svc.emitAsync(new BarEvent());

    expect(handler).toBeCalledTimes(3);
});

/**
 * =========== LAST EVENT RE-EMISSION AFTER SUBSCRIPTION ===========
 */

test('re-emits last previously emitted event after subscription when required', () => {
    // emit first
    event_svc.emitAsync(new FooEvent(), anchor_local);

    // handle with automatic re-emitting last previously emitted event of this type
    event_svc.subscribe(FooEvent, handler, anchor_local, true);

    expect(handler).toBeCalledTimes(1);
});

test('does not re-emit last previously emitted event after subscription when required for global anchors', () => {
    // emit first
    event_svc.emitAsync(new FooEvent());

    // handle with automatic re-emitting last previously emitted event of this type
    event_svc.subscribe(FooEvent, handler, null, true);

    expect(handler).toBeCalledTimes(0);
});

/**
 * =========== EVENT TYPE INHERITANCE ===========
 */
test('runs handlers of parent event type subscriptions', () => {
    // subscribe to BarEvent, SubBarEvent's parent
    event_svc.subscribe(BarEvent, handler);

    // emit event of SubBarEvent, BarEvent's child
    event_svc.emitAsync(new SubBarEvent());

    expect(handler).toBeCalledTimes(1);

    // it even should work recursively
    event_svc.emitAsync(new SubSubBarEvent());

    expect(handler).toBeCalledTimes(2);
});
