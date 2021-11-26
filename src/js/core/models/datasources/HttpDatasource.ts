import SynchronousDatasource from "../../base/model/datasources/SynchronousDatasource";
import HttpMiddleware from "../middlewares/HttpMiddleware";

/**
 * @category Core
 * @subcategory Datasources
 */
export enum RequestCredentials {
    Include = 'include',
    SameOrigin = 'same-origin',
    Omit = 'omit'
}

/**
 * @category Core
 * @subcategory Datasources
 */
export enum RequestCache {
    Default = 'default',
    NoCache = 'no-cache',
    Reload = 'reload',
    ForceCache = 'force-cache',
    OnlyIfCached = 'only-if-cached'
}

/**
 * @category Core
 * @subcategory Datasources
 */
export enum RequestMode {
    NoCORS = 'no-cors',
    CORS = 'cors',
    SameOrigin = 'same-origin'
}

/**
 * @category Core
 * @subcategory Datasources
 */
export enum RequestMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

/**
 * @category Core
 * @subcategory Datasources
 */
export type Query = {[key: string]: any};

/**
 * @category Core
 * @subcategory Datasources
 */
export type RequestOptions = {
    mode: RequestMode;
    cache: RequestCache;
    credentials: RequestCredentials;
}

/**
 * @category Core
 * @subcategory Datasources
 */
export enum RequestRedirect {
    Follow = 'follow',
    Error = 'error',
    Manual = 'manual'
}

/**
 * @category Core
 * @subcategory Datasources
 */
export type RequestParams = {
    query?: Query;
    headers?: {[key: string]: string};
    data?: any;
    redirect?: RequestRedirect;
    method?: RequestMethod|string;
    timeout?: number;
}

/**
 * @category Core
 * @subcategory Datasources
 */
export type FakeHttpRule = {
    path: string;
    params: RequestParams;
    response_data: object;
};

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

/**
 * An implementation of client-server communication via HTTP
 * 
 * Based on fetch API.
 * 
 * Allows to fake responses (for debugging/testing purposes)
 * 
 * @category Core
 * @subcategory Datasources
 */
export default class HttpDatasource extends SynchronousDatasource {
    private readonly hostname: string;
    /** common request parameters */
    private options: RequestOptions;
    /** request modifiers */
    private middleware: HttpMiddleware[] = [];
    /** request-to-response mapper */
    private fake_response_generator: (path: string, params: RequestParams) => object;

    /**
     * Sets basic config for the datasource
     * 
     * @param addr      address of HTTP host to request
     * @param port      port of the host
     * @param options   additional request options
     */
    constructor(addr: string, port?: number, options: RequestOptions = DefaultOptions) {
        super();

        if (!(addr.startsWith('http://') || addr.startsWith('https://'))) {
            addr = `http://${addr}`;
        }

        this.hostname = port ? `${addr}:${port}` : addr;
        this.options = options;
    }

    /**
     * Provides the hostname configured in the app to models that use this datasource 
     * 
     * @returns hostname configured by the app
     */
    public get host_name() {
        return this.hostname;
    }

    /**
     * Attaches middlewares provided
     * 
     * @param middleware list of middlewares to attach
     */
    public registerMiddleware(middleware: HttpMiddleware[] = []) {
        this.middleware = middleware;
    }

    /**
     * Makes a request to the server configured
     * 
     * @param path      URL of the request (schema, host and query parts are not included)
     * @param params    request parameters, some will override defaults
     * 
     * @returns JSON response if applicable
     */
    async request(path: string, params: RequestParams = {}): Promise<any> {
        const fake_response = this.fake_response_generator && this.fake_response_generator(path, params);

        if (fake_response !== undefined) return fake_response;

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
            // referrerPolicy: "no-referrer",
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

    /**
     * Constructs complete URL for the server configured by given `path` and `query`
     * 
     * @param path  URL of the request (schema, host and query parts are not included)
     * @param query key-value pairs of query parameters
     * 
     * @returns complete URL containing all parts to be requested sufficiently 
     */
    public buildURL(path: string, query?: Query) {
        path = path.replace(/^\/+|\/+$/gm, '');
        path += '/';

        const q = HttpDatasource.serializeQuery(query);

        return `${this.hostname}/${path}?${q}`;
    }

    /**
     * Defines given requests (URL and params) mapped to responses in order to return
     * them instead of requesting an HTTP server if proivded
     * 
     * If required to apply more fine-grained mapping, {@link setFakeGenerator} 
     * to define how rules should be resolved to responses.
     * 
     * @param rules 
     */
    public setFakeRules(rules: FakeHttpRule[]) {
        this.fake_response_generator = (path, params) => {
            for (const rule of rules) {
                if (rule.path == path &&
                    rule.params.method == params.method &&
                    rule.params.query == params.query
                ) {
                    return rule.response_data;
                }
            }

            return undefined;
        }
    }

    /**
     * Defines a function to generate fake responses to return them instead
     * of requesting real HTTP server if provided
     * 
     * @param generator response generator
     */
    public setFakeGenerator(generator: (path: string, params: RequestParams) => object) {
        this.fake_response_generator = generator;
    }

    /**
     * Converts key-value pairs to URL query string
     * 
     * @param query key-value pairs of query parameters
     * 
     * @returns query string
     */
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