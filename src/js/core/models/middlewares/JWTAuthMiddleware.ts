import HttpMiddleware from "./HttpMiddleware";
import {RequestParams} from "../datasources/HttpDatasource";
import JWTAuthModel from "../JWTAuthModel";

// TODO: Call JWTAuthModel actions to authenticate

/**
 * @category Core.Models
 * @subcategory Middlewares
 */
export default class JWTAuthMiddleware extends HttpMiddleware {
    private auth_model: JWTAuthModel<any>;
    public token: string;

    constructor(auth_model: JWTAuthModel<any>) {
        super();

        this.auth_model = auth_model;
    }

    public apply(request_params: RequestParams): void {
        if (this.token) {
            request_params.headers['Authorization'] = `Bearer ${this.token}`;
        }
    }
}