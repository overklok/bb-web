import HttpDatasource, {Query, RequestMethod} from "./datasources/HttpDatasource";
import HttpModel from "./HttpModel";

type PathGenerator = (t: {[key: string]: any}) => string;

/**
 * Actions available to request in {@link CRUDHttpModel}
 */
export enum CRUDAction {
    Create,
    Read,
    Update,
    Delete,
    List
}

/**
 * {@link CRUDAction} to URL mapping for specific {@link CRUDHttpModel}
 */
export type CRUDSchema = {
    [action in CRUDAction]?: PathGenerator;
};

export type PathParams = {[key: string]: number|string};

/**
 * An {@link HttpModel} which provides CRUD-defined functions
 * 
 * To use the model, configure the schema by setting the URL for each available action.
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class CRUDHttpModel<MS> extends HttpModel<MS, HttpDatasource> {
    /**
     * CRUD-URL mapping for the model
     */
    protected abstract schema(): CRUDSchema;

    /**
     * The name of the host configured in the datasource
     */
    get host_name() {
        return this.data_source.host_name;
    }

    /**
     * Requests list of resources
     * 
     * @param params action parameters
     * @param query  query parameters    
     * 
     * @returns array of the model data objects 
     */
    async list(params: PathParams = {}, query?: Query): Promise<MS[]> {
        if (!this.schema()[CRUDAction.List]) throw Error("Batch reading is not available for this model");

        const path = this.schema()[CRUDAction.List](params);

        return await this.request(path, {query, method: RequestMethod.GET}) as [];
    }

    /**
     * Retrieves the resource
     * 
     * @param params action parameters
     * @param query  query parameters
     * 
     * @returns model data object
     */
    async read(params: PathParams, query?: Query): Promise<MS> {
        if (!this.schema()[CRUDAction.Read]) throw Error("Reading is not available for this model");

        const path = this.schema()[CRUDAction.Read](params);

        return await this.request(path, {query, method: RequestMethod.GET});
    }

    /**
     * Requests resource creation
     * 
     * @param params action parameters
     * @param query  query parameters
     */
    async create(params: PathParams, query?: Query, data?: object): Promise<void> {
        if (!this.schema()[CRUDAction.Create]) throw Error("Creation is not available for this model");

        const path = this.schema()[CRUDAction.Create](params);

        return await this.request(path, {query, data, method: RequestMethod.GET});
    }

    /**
     * Requests resource update
     * 
     * @param params action parameters
     * @param query  query parameters
     */
    async update(params: PathParams, query?: Query, data?: object): Promise<void> {
        if (!this.schema()[CRUDAction.Update]) throw Error("Updating is not available for this model");

        const path = this.schema()[CRUDAction.Update](params);

        return await this.request(path, {query, data, method: RequestMethod.PUT});
    }

    /**
     * Requests resource deletion
     * 
     * @param params action parameters
     * @param query  query parameters
     */
    async delete(params: PathParams, query?: Query): Promise<void> {
        if (!this.schema()[CRUDAction.Delete]) throw Error("Deletion is not available for this model");

        const path = this.schema()[CRUDAction.Delete](params);

        return await this.request(path, {query, method: RequestMethod.DELETE});
    }
}