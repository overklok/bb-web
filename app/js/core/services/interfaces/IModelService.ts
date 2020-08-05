import {ModelConstructor} from "../../base/model/Model";
import Datasource from "../../base/model/Datasource";
import IEventService from "./IEventService";

export default class IModelService {
    protected svc_event: IEventService;

    setup(svc_event: IEventService) {
        this.svc_event = svc_event;
    }
    
    register<DS extends Datasource>(abstrakt: ModelConstructor<DS>, data_source: DS, state_initial?: object) {
        throw new Error('abstract');
    }

    retrieve<M extends ModelConstructor<any>>(abstrakt: M): InstanceType<M> {
        throw new Error('abstract');
    }
}