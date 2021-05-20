import HttpModel, {RequestErrorEvent} from "../../core/base/model/HttpModel";
import {RequestMethod} from "../../core/base/model/datasources/HttpDatasource";

export default class LogModel extends HttpModel<any> {
    static alias = 'log';

    protected defaultState: any;

    async registerSnapshots(snapshots: any) {
        const response = await this.request(
            'logsvc/snapshot',
            {data: snapshots, method: RequestMethod.POST}
        );

        if (response.status == 'OK') {
            return this.data_source.buildURL(response.url);
        }

        throw new RequestErrorEvent("Request error: " + response.message || "[unknown]");
    }
}