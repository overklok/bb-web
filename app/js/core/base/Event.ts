import DTO from "../helpers/DTO"

export abstract class AbstractEvent<T> extends DTO<T> {}
export abstract class ViewEvent<T> extends AbstractEvent<T> {}

export class Action<T> extends AbstractEvent<T> {
    static Alias: string = 'undefined';
}

export class BooleanAction<T> extends Action<T> {
    static Type = 'boolean';
    value: boolean
}