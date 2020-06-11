/**
 * @abstract
 */
import IConfigService from "./interfaces/IConfigService";
import {ConfigConstructor, IConfig} from "../helpers/IConfig";

export default class ConfigService extends IConfigService {
    private bindings: Map<ConfigConstructor, object> = new Map();

    configure(abstrakt: ConfigConstructor, concrete: object) {
        if (typeof abstrakt !== "string") {
            concrete = new abstrakt(concrete);

            if ('preprocess' in concrete) {
                (concrete as IConfig).preprocess();
            }
        }

        this.bindings.set(abstrakt, concrete);
    }

    configuration<V extends ConfigConstructor>(abstrakt: V): InstanceType<V> {
        return this.bindings.get(abstrakt) as InstanceType<V>;
    }
}