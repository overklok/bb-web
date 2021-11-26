import {RequestParams} from "../datasources/HttpDatasource";
import {Middleware} from "../../base/model/Datasource";

/**
 * A middleware that applies to {@link HttpDatasource} to modify requests
 * 
 * @category Core
 * @subcategory Model
 */
export default abstract class HttpMiddleware extends Middleware {
    public abstract apply(request_params: RequestParams): void;
}