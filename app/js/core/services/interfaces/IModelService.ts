import Model, {ModelConstructor} from "../../base/model/Model";

export default class IModelService {
    register(abstrakt: ModelConstructor, state_initial?: object) {
        throw new Error('abstract')
    }

    retrieve<V extends ModelConstructor>(abstrakt: V): InstanceType<V> {
        throw new Error('abstract');
    }
}