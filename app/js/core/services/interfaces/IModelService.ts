import {ModelConstructor, ModelState} from "../../base/model/Model";
import Datasource from "../../base/model/Datasource";
import IEventService from "./IEventService";
import AsynchronousDatasource from "../../base/model/datasources/AsynchronousDatasource";

export default class IModelService {
    protected svc_event: IEventService;

    setup(svc_event: IEventService) {
        this.svc_event = svc_event;
    }

    launch(args: AsynchronousDatasource) {
        Array.from(arguments).map(
            data_source => IModelService.launchDataSource(data_source)
        )
    }
    
    register<MS extends ModelState, DS extends Datasource>(abstrakt: ModelConstructor<MS, DS>, data_source: DS, state_initial?: MS) {
        throw new Error('abstract');
    }

    retrieve<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>(abstrakt: M): InstanceType<M> {
        throw new Error('abstract');
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