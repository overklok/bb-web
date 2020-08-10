import SynchronousDatasource from "../../base/model/datasources/SynchronousDatasource";
import HttpMiddleware from "../../base/model/middlewares/HttpMiddleware";

export enum RequestCredentials {
    Include = 'include',
    SameOrigin = 'same-origin',
    Omit = 'omit'
}

export enum RequestCache {
    Default = 'default',
    NoCache = 'no-cache',
    Reload = 'reload',
    ForceCache = 'force-cache',
    OnlyIfCached = 'only-if-cached'
}

export enum RequestMode {
    NoCORS = 'no-cors',
    CORS = 'cors',
    SameOrigin = 'same-origin'
}

export enum RequestMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

export type Query = {[key: string]: any};

export type RequestOptions = {
    mode: RequestMode;
    cache: RequestCache;
    credentials: RequestCredentials;
}

export enum RequestRedirect {
    Follow = 'follow',
    Error = 'error',
    Manual = 'manual'
}

export type RequestParams = {
    query?: Query;
    headers?: {[key: string]: string};
    data?: any;
    redirect?: RequestRedirect;
    method?: RequestMethod|string;
}

const DefaultOptions: RequestOptions = {
    mode: RequestMode.CORS,
    cache: RequestCache.Default,
    credentials: RequestCredentials.SameOrigin
}

export default class HttpDatasource extends SynchronousDatasource {
    private readonly hostname: string;
    private options: RequestOptions;
    private middleware: HttpMiddleware[] = [];

    constructor(addr: string, port?: number, options: RequestOptions = DefaultOptions) {
        super();

        if (!(addr.startsWith('http://') || addr.startsWith('https://'))) {
            addr = `http://${addr}`;
        }

        this.hostname = port ? `${addr}:${port}` : addr;
        this.options = options;
    }

    public registerMiddleware(middleware: HttpMiddleware[] = []) {
        this.middleware = middleware;
    }

    async request(path: string, params: RequestParams = {}) {
        params = {
            query: {},
            headers: {},
            data: {},
            redirect: RequestRedirect.Follow,
            method: RequestMethod.GET,
            ...params
        }

        for (const mw of this.middleware) {
            mw.apply(params);
        }

        const q = HttpDatasource.serializeQuery(params.query);

        path = path.replace(/^\/+|\/+$/gm, '');

        const response = await fetch(`${this.hostname}/${path}?${q}`, {
            method:         params.method,
            redirect:       params.redirect,
            mode:           this.options.mode,
            cache:          this.options.cache,
            credentials:    this.options.credentials,
            referrerPolicy: "no-referrer",
            headers: {
                'Content-Type': 'application/json',
                ...params.headers
            },
            body: JSON.stringify(params.data)
        });

        return await response.json();
    }

    private static serializeQuery(query: Query = {}): string {
        let i = 0;
        let q = "";

        for (const [key, value] of Object.entries(query)) {
            const prefix = i === 0 ? '' : '$';

            q += `${prefix}${key}=${value}`;

            i++;
        }

        return q;
    }
}