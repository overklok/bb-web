import IModelService from "./interfaces/IModelService";
import Model, {ModelConstructor} from "../base/model/Model";
import Datasource from "../base/model/Datasource";
import IEventService from "./interfaces/IEventService";


export default class ModelService extends IModelService {
    private bindings: Map<ModelConstructor<any>, Model<any>> = new Map();

    register<DS extends Datasource>(abstrakt: ModelConstructor<DS>, data_source: DS, state_initial?: object) {
        const model = new abstrakt(data_source, this.svc_event, state_initial);

        this.bindings.set(abstrakt, model);
    }

    retrieve<V extends ModelConstructor<any>>(abstrakt: V): InstanceType<V> {
        return this.bindings.get(abstrakt) as InstanceType<V>;
    }
}