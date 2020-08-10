import {RequestParams} from "../../../models/datasources/HttpDatasource";

export default abstract class HttpMiddleware {
    public abstract apply(request_params: RequestParams): void;
}