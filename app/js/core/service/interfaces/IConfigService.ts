import IConfiguration from "../../helpers/IConfiguration";
import IBindable from "../../helpers/IBindable";

/**
 * @abstract
 */
export default class IConfigService {
    configure<V extends IConfiguration & IBindable>(abstrakt: string|V, concrete: object) {
        throw new Error('abstract')
    }

    configuration<V extends IConfiguration & IBindable>(abstrakt: string|V): InstanceType<V> {
        throw new Error('abstract');
    }
}