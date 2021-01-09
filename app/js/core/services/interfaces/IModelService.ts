import Model, {ModelConstructor, ModelState} from "../../base/model/Model";
import Datasource from "../../base/model/Datasource";
import AsynchronousDatasource from "../../base/model/datasources/AsynchronousDatasource";
import IEventService from "./IEventService";

export default class IModelService {
    protected svc_event: IEventService;
    protected models: Model<any, any>[];

    public setup(svc_event: IEventService): void {
        throw new Error('abstract');
    }

    public launch(args: AsynchronousDatasource): void {
        throw new Error('abstract');
    }
    
    public register<MS extends ModelState, DS extends Datasource, MC extends ModelConstructor<MS, DS>> (
        abstrakt: ModelConstructor<MS, DS>, data_source: DS, state_initial?: Partial<MS>
    ): Model<MS, DS>
    {
        throw new Error('abstract');
    }

    public retrieve<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>(abstrakt: M): InstanceType<M> {
        throw new Error('abstract');
    }

    public getModels(): {[name: string]: Model<any, any>} {
        throw new Error('abstract');
    }
}