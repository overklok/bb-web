/**
 * @abstract
 */
import {ConfigurationConstructor, IConfiguration} from "../../helpers/IConfiguration";

export default class IConfigService {
    configure(abstrakt: ConfigurationConstructor, concrete: object) {
        throw new Error('abstract')
    }

    configuration<V extends ConfigurationConstructor>(abstrakt: V): InstanceType<V> {
        throw new Error('abstract');
    }
}