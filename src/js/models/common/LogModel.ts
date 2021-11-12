import HttpModel, {RequestErrorEvent} from "../../core/models/HttpModel";
import {RequestMethod} from "~/js/core/models/datasources/HttpDatasource";

export default class LogModel extends HttpModel<any> {
    static alias = 'log';

    protected defaultState: any;

    async registerSnapshots(snapshots: any) {
        const response = await this.request(
            'logs/snapshot',
            {data: snapshots, method: RequestMethod.POST}
        );

        if (response.status == 'OK') {
            return this.data_source.buildURL(response.url);
        }

        throw new RequestErrorEvent({ message: "Request error: " + response.message || "[unknown]" });
    }
}