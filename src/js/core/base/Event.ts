import DTO from "../helpers/DTO"

/**
 * A class representing data that flows between systems components typically via IEventService.
 * 
 * @category Core
 * @subcategory Event
 */
export abstract class AbstractEvent<T> extends DTO<T> {
}

/**
 * A subset of AbstractEvent which describes data streamed between Views and Presenters.
 * 
 * @category Core
 * @subcategory Event
 */
export abstract class ViewEvent<T> extends AbstractEvent<T> {
}

/**
 * A subset of AbstractEvent which describes data streamed between Models and Presenters.
 * 
 * @category Core
 * @subcategory Event
 */
export abstract class ModelEvent<T> extends AbstractEvent<T> {
}

/**
 * @category Core
 * @subcategory Event
 */
export class GenericErrorEvent extends ModelEvent<GenericErrorEvent> {
    error: Error;
}

/**
 * A subset of ModelEvent which is used to work with routing.
 * 
 * @category Core
 * @subcategory Event
 */
export class RouteEvent<T> extends ModelEvent<T> {}

/**
 * A special kind of ViewEvent which can be visually represented in Views
 * to emit events directly from UI components.
 * 
 * @category Core
 * @subcategory Event
 */
export class Action<T> extends ViewEvent<T> {
    static Alias: string = 'undefined';
}

/**
 * A special kind of Action which can also provide boolean data from the UI.
 * 
 * @category Core
 * @subcategory Event
 */
export class BooleanAction<T> extends Action<T> {
    value: boolean
}