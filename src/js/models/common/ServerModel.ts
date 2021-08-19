import HttpModel, {RequestErrorEvent} from "../../core/base/model/HttpModel";
import {RequestMethod} from "../../core/base/model/datasources/HttpDatasource";

export default class ServerModel extends HttpModel<any> {
    static alias = 'server';

    protected defaultState: any;

    async getVersion() {
        const response = await this.request(
            'meta/version',
            {method: RequestMethod.GET}
        );

        return response;
    }
}