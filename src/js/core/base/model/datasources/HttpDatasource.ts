import SynchronousDatasource from "./SynchronousDatasource";
import HttpMiddleware from "../middlewares/HttpMiddleware";

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
    timeout?: number;
}

const DefaultOptions: RequestOptions = {
    mode: RequestMode.CORS,
    cache: RequestCache.Default,
    credentials: RequestCredentials.SameOrigin
}

async function fetchWithTimeout(resource: RequestInfo, options: any) {
    const { timeout = 8000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
  
    return response;
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

    public get host_name() {
        return this.hostname;
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

        let fetch_init: any = {
            method:         params.method,
            redirect:       params.redirect,
            timeout:        params.timeout,
            mode:           this.options.mode,
            cache:          this.options.cache,
            credentials:    this.options.credentials,
            referrerPolicy: "no-referrer",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...params.headers
            },
        }

        if (params.method != RequestMethod.GET && params.method != RequestMethod.DELETE) {
            fetch_init.body = JSON.stringify(params.data);
        }

        const response = await fetchWithTimeout(this.buildURL(path, params.query), fetch_init);

        if (!response.ok) {
            // let content;

            // try {
                // content = await response.text();
            // } catch {}
            throw new Error(response.statusText);
        }

        return await response.json();
    }

    public buildURL(path: string, query?: Query) {
        path = path.replace(/^\/+|\/+$/gm, '');
        path += '/';

        const q = HttpDatasource.serializeQuery(query);

        return `${this.hostname}/${path}?${q}`;
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