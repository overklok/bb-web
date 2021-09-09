import Model, {ModelConstructor, ModelState} from "../../base/model/Model";
import Datasource from "../../base/model/Datasource";
import AsynchronousDatasource from "../../base/model/datasources/AsynchronousDatasource";
import IEventService from "./IEventService";

/**
 * MVC/MVP's Model layer interface
 * 
 * Note that this is an interface, although it's defined as a class just to keep it available in runtime.
 * 
 * Depends on {@link IEventService}
 *
 * @abstract
 * 
 * @category Core
 */
export default class IModelService {
    /** event service instance */
    protected svc_event: IEventService;
    /** model registry */
    protected models: Model<any, any>[];

    /**
     * Passes external dependencies of the service
     * 
     * @param svc_event Event service instance
     */
    public setup(svc_event: IEventService): void {
        throw new Error('abstract');
    }

    /**
     * Launches the model by passing the datasource 
     * 
     * @param args 
     */
    public launch(args: AsynchronousDatasource): void {
        throw new Error('abstract');
    }
    
    /**
     * Passes the model to the registry
     * 
     * @param abstrakt      Model classname
     * @param data_source   datasource instance required by the model
     * @param state_initial initial Model state
     */
    public register<MS extends ModelState, DS extends Datasource, MC extends ModelConstructor<MS, DS>> (
        abstrakt: ModelConstructor<MS, DS>, data_source: DS, state_initial?: Partial<MS>
    ): Model<MS, DS>
    {
        throw new Error('abstract');
    }

    /**
     * Retrieves the model instance from the registry by classname
     * 
     * @param abstrakt classname of the model to retrieve
     */
    public retrieve<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>(abstrakt: M): InstanceType<M> {
        throw new Error('abstract');
    }

    /**
     * @returns the object containing models keyed by its aliases, see {@link Model.alias}
     */
    public getModels(): {[name: string]: Model<any, any>} {
        throw new Error('abstract');
    }
}