import IModelService from "./interfaces/IModelService";
import Model, {ModelConstructor, ModelState} from "../base/model/Model";
import Datasource from "../base/model/Datasource";


export default class ModelService extends IModelService {
    private bindings: Map<ModelConstructor<any, any>, Model<any, any>> = new Map();

    register<MS extends ModelState, DS extends Datasource>(
        abstrakt: ModelConstructor<MS, DS>, data_source: DS, state_initial?: Partial<MS>
    ): Model<MS, DS>
    {
        const model = new abstrakt(data_source, this.svc_event);
        model.init(state_initial);

        this.bindings.set(abstrakt, model);

        this.models.push(model);

        return model;
    }

    retrieve<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>(abstrakt: M): InstanceType<M> {
        return this.bindings.get(abstrakt) as InstanceType<M>;
    }
}