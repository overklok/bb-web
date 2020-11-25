import DTO from "../helpers/DTO"

/**
 * A class representing data that flows between systems components typically via IEventService.
 */
export abstract class AbstractEvent<T> extends DTO<T> {
}

/**
 * A subset of AbstractEvent which describes data streamed between Views and Presenters.
 */
export abstract class ViewEvent<T> extends AbstractEvent<T> {
}

/**
 * A subset of AbstractEvent which describes data streamed between Models and Presenters.
 */
export abstract class ModelEvent<T> extends AbstractEvent<T> {
}

/**
 * A subset of ModelEvent which is used to work with routing.
 */
export class RouteEvent<T> extends ModelEvent<T> {}

/**
 * A special kind of ViewEvent which can be visually represented in Views
 * to emit events directly from UI components.
 */
export class Action<T> extends ViewEvent<T> {
    static Alias: string = 'undefined';
}

/**
 * A special kind of Action which can also provide boolean data from the UI.
 */
export class BooleanAction<T> extends Action<T> {
    value: boolean
}