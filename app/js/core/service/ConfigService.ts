/**
 * @abstract
 */
import IConfigService from "./interfaces/IConfigService";
import {ConfigurationConstructor, IConfiguration} from "../helpers/IConfiguration";

export default class ConfigService extends IConfigService {
    private bindings: Map<ConfigurationConstructor, object> = new Map();

    configure(abstrakt: ConfigurationConstructor, concrete: object) {
        if (typeof abstrakt !== "string") {
            concrete = new abstrakt(concrete);

            if ('preprocess' in concrete) {
                (concrete as IConfiguration).preprocess();
            }
        }

        this.bindings.set(abstrakt, concrete);
    }

    configuration<V extends ConfigurationConstructor>(abstrakt: V): InstanceType<V> {
        return this.bindings.get(abstrakt) as InstanceType<V>;
    }
}