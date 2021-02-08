import Model from "./Model";
import HttpDatasource, {RequestParams} from "./datasources/HttpDatasource";
import {ModelEvent} from "../Event";

export class RequestErrorEvent extends ModelEvent<RequestErrorEvent> {}

export default abstract class HttpModel<MS, DS extends HttpDatasource=HttpDatasource> extends Model<MS, DS> {
    protected async request(path: string, request: RequestParams) {
        try {
            return await this.data_source.request(path, request);
        } catch (e) {
            this.emit(new RequestErrorEvent());
            throw e;
        }
    }
}