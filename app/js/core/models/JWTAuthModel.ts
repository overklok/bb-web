import HttpDatasource, {RequestMethod} from "../base/model/datasources/HttpDatasource";
import HttpModel from "../base/model/HttpModel";

export type JWTAuthData = {
    token: string
}

export type JWTRefreshData = {
    refresh_token: string
}

export default abstract class JWTAuthModel<MS> extends HttpModel<MS, HttpDatasource> {
    public async login(username: string, password: string): Promise<JWTAuthData> {
        const data = {username, password};

        const {jwt_token} = await this.request('api/login', {data, method: RequestMethod.POST});

        return {token: jwt_token};
    }

    public async refresh(): Promise<JWTRefreshData> {
        return {refresh_token: undefined};
    }
}