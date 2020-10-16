import Model, {ModelConstructor, ModelState} from "../../base/model/Model";
import Datasource from "../../base/model/Datasource";
import AsynchronousDatasource from "../../base/model/datasources/AsynchronousDatasource";
import IEventService from "./IEventService";
import {getClassNameAlias} from "../../helpers/functions";

export default class IModelService {
    protected svc_event: IEventService;
    protected models: Model<any, any>[] = [];

    public setup(svc_event: IEventService): void {
        this.svc_event = svc_event
    }

    public launch(args: AsynchronousDatasource): void {
        Array.from(arguments).map(
            data_source => IModelService.launchDataSource(data_source)
        )
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
        const models: {[name: string]: Model<any, any>} = {};

        for (const model of this.models) {
            const model_name = model.constructor.name;
            const model_alias = getClassNameAlias(model_name, 'Model');

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