import HttpDatasource, {RequestMethod} from "../base/model/datasources/HttpDatasource";
import HttpModel from "../base/model/HttpModel";

/**
 * @category Core.Models
 */
export type JWTAuthData = {
    token: string
}

/**
 * @category Core.Models
 */
export type JWTRefreshData = {
    refresh_token: string
}

/**
 * @category Core.Models
 */
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