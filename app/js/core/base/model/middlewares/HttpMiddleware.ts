import {RequestParams} from "../../../models/datasources/HttpDatasource";
import {Middleware} from "../Datasource";

export default abstract class HttpMiddleware extends Middleware {
    public abstract apply(request_params: RequestParams): void;
}