import Model from "./Model";
import HttpDatasource, {RequestParams} from "./datasources/HttpDatasource";
import {ModelEvent} from "../Event";

export class RequestErrorEvent extends ModelEvent<RequestErrorEvent> {
    status: number;
    message: string;
}

export default abstract class HttpModel<MS, DS extends HttpDatasource=HttpDatasource> extends Model<MS, DS> {
    protected async request(path: string, request: RequestParams) {
        try {
            return await this.data_source.request(path, request);
        } catch (e) {
            this.emit(new RequestErrorEvent({message: e.message}));
            // console.trace('Stack trace for further error:');
            
            throw e;
        }
    }
}