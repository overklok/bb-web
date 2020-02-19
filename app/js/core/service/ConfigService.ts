/**
 * @abstract
 */
import IConfigService from "./interfaces/IConfigService";
import IConfiguration from "../helpers/IConfiguration";
import IBindable from "../helpers/IBindable";

export default class ConfigService extends IConfigService {
    private bindings: Map<string|IConfiguration, object> = new Map();

    configure<V extends IConfiguration & IBindable>(abstrakt: string|V, concrete: object) {
        this.bindings.set(abstrakt, concrete);
    }

    configuration<V extends IConfiguration & IBindable>(abstrakt: string|V): InstanceType<V> {
        return this.bindings.get(abstrakt) as InstanceType<V>;
    }
}