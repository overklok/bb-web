import Model from "./Model";
import HttpDatasource, {RequestParams} from "../../models/datasources/HttpDatasource";

export default class HttpModel<MS, DS extends HttpDatasource> extends Model<MS, DS> {
    protected async request(path: string, request: RequestParams) {
        return await this.data_source.request(path, request);
    }
}