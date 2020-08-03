import IModelService from "./interfaces/IModelService";
import Model, {ModelConstructor} from "../base/model/Model";


export default class ModelService extends IModelService {
    private bindings: Map<ModelConstructor, object> = new Map();

    register(abstrakt: ModelConstructor, state_initial?: object) {
        this.bindings.set(abstrakt, state_initial);
    }

    retrieve<V extends ModelConstructor>(abstrakt: V): InstanceType<V> {
        const state_initial = this.bindings.get(abstrakt);

        return state_initial ? new abstrakt(state_initial) as InstanceType<V> : undefined;
    }
}