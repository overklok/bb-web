import HttpDatasource, {Query, RequestMethod} from "./datasources/HttpDatasource";
import HttpModel from "./HttpModel";

type PathGenerator = (t: {[key: string]: any}) => string;

export enum CRUDAction {
    Create,
    Read,
    Update,
    Delete,
    List
}

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
    protected abstract schema(): CRUDSchema;

    get host_name() {
        return this.data_source.host_name;
    }

    async list(params: PathParams = {}, query?: Query): Promise<any[]> {
        if (!this.schema()[CRUDAction.List]) throw Error("Batch reading is not available for this model");

        const path = this.schema()[CRUDAction.List](params);

        return await this.request(path, {query, method: RequestMethod.GET}) as [];
    }

    async read(params: PathParams, query?: Query) {
        if (!this.schema()[CRUDAction.Read]) throw Error("Reading is not available for this model");

        const path = this.schema()[CRUDAction.Read](params);

        return await this.request(path, {query, method: RequestMethod.GET});
    }

    async create(params: PathParams, query?: Query, data?: object) {
        if (!this.schema()[CRUDAction.Create]) throw Error("Creation is not available for this model");

        const path = this.schema()[CRUDAction.Create](params);

        return await this.request(path, {query, data, method: RequestMethod.GET});
    }

    async update(params: PathParams, query?: Query, data?: object) {
        if (!this.schema()[CRUDAction.Update]) throw Error("Updating is not available for this model");

        const path = this.schema()[CRUDAction.Update](params);

        return await this.request(path, {query, data, method: RequestMethod.PUT});
    }

    async delete(params: PathParams, query?: Query) {
        if (!this.schema()[CRUDAction.Delete]) throw Error("Deletion is not available for this model");

        const path = this.schema()[CRUDAction.Delete](params);

        return await this.request(path, {query, method: RequestMethod.DELETE});
    }
}