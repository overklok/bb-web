import IBindable from "../helpers/IBindable";

/**
 * @abstract
 */
export default class IEventService {
    constructor() {throw new Error('abstract')}

    public foo(): string {throw new Error('abstract')}
}