import DTO from "../helpers/DTO"

export abstract class AbstractEvent<T> extends DTO<T> {}
export abstract class ViewEvent<T> extends AbstractEvent<T> {}