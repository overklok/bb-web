import IBindable from "../../helpers/IBindable";

/**
 * @abstract
 */
export default class IEventService {
    public foo(): string {throw new Error('abstract')}
}