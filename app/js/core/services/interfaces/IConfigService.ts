/**
 * @abstract
 */
import {ConfigConstructor, IConfig} from "../../helpers/IConfig";

export default class IConfigService {
    configure(abstrakt: ConfigConstructor, concrete: object) {
        throw new Error('abstract')
    }

    configuration<V extends ConfigConstructor>(abstrakt: V): InstanceType<V> {
        throw new Error('abstract');
    }
}