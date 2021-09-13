import IModelService from "./interfaces/IModelService";
import Model, {ModelConstructor, ModelState} from "../base/model/Model";
import Datasource from "../base/model/Datasource";
import AsynchronousDatasource from "../base/model/datasources/AsynchronousDatasource";
import IEventService from "./interfaces/IEventService";
import {getClassNameAlias} from "../helpers/functions";


/** 
 * An implementation of the MVC/MVP's Model layer 
 * 
 * Manages the registry of the {@link Model} singleton objects for apps and services.
 * 
 * @see Model
 * 
 * @inheritdoc
 */
export default class ModelService extends IModelService {
    protected models: Model<any, any>[] = [];

    private bindings: Map<ModelConstructor<any, any>, Model<any, any>> = new Map();

    public setup(svc_event: IEventService): void {
        this.svc_event = svc_event;
    }

    public register<MS extends ModelState, DS extends Datasource>(
        abstrakt: ModelConstructor<MS, DS>, data_source: DS, state_initial?: Partial<MS>
    ): Model<MS, DS>
    {
        const model = new abstrakt(data_source, this.svc_event);
        model.init(state_initial);

        this.bindings.set(abstrakt, model);

        this.models.push(model);

        return model;
    }

    public retrieve<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>(abstrakt: M): InstanceType<M> {
        return this.bindings.get(abstrakt) as InstanceType<M>;
    }

    public launch(args: AsynchronousDatasource): void {
        Array.from(arguments).map(
            data_source => ModelService.launchDataSource(data_source)
        )
    }

    public getModels(): {[name: string]: Model<any, any>} {
        const models: {[name: string]: Model<any, any>} = {};

        for (const model of this.models) {
            let model_alias = (model as any).constructor.alias || (model as any).__proto__.constructor.alias;

            if (!model_alias) {
                const model_name = model.constructor.name;
                model_alias = getClassNameAlias(model_name, 'Model');
            }

            models[model_alias] = model;
        }

        return models;
    }

    private static async launchDataSource(data_source: AsynchronousDatasource) {
        try {
            await data_source.init();
            data_source.connect();
        } catch (e) {
            console.error(`${data_source.constructor.name} is failed to launch.`);
        }
    }
}