import Cookies from 'js-cookie';
import HttpMiddleware from "../../base/model/middlewares/HttpMiddleware";
import {RequestParams} from "../../base/model/datasources/HttpDatasource";

/**
 * @category Core.Models
 * @subcategory Middlewares
 */
export default class CSRFMiddleware extends HttpMiddleware {
    public token: string;

    constructor() {
        super();

        this.token = Cookies.get('csrftoken');

        if (typeof this.token === "undefined") {
            console.error("Cannot load CSRF cookie");
        }
    }

    public apply(request_params: RequestParams): void {
        if (this.token) {
            request_params.headers['X-CSRFToken'] = this.token;
        }
    }
}