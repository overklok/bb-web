import {ModelConstructor, ModelState} from "../../base/model/Model";
import Datasource from "../../base/model/Datasource";
import IEventService from "./IEventService";

export default class IModelService {
    protected svc_event: IEventService;

    setup(svc_event: IEventService) {
        this.svc_event = svc_event;
    }
    
    register<MS extends ModelState, DS extends Datasource>(abstrakt: ModelConstructor<MS, DS>, data_source: DS, state_initial?: MS) {
        throw new Error('abstract');
    }

    retrieve<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>(abstrakt: M): InstanceType<M> {
        throw new Error('abstract');
    }
}