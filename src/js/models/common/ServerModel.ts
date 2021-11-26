import HttpModel from "~/js/core/models/HttpModel";
import {RequestMethod} from "~/js/core/models/datasources/HttpDatasource";

export default class ServerModel extends HttpModel<any> {
    static alias = 'server';

    protected defaultState: any;

    async getVersion() {
        const response = await this.request(
            'meta/version',
            { method: RequestMethod.GET }
        );

        return response;
    }

    async getLatestClient(): Promise<{ version: string, file: string }> {
        const response = await this.request(
            'distros/latest',
            { method: RequestMethod.GET }
        );

        return {
            version: response.version,
            file: response.file
        };
    }
}