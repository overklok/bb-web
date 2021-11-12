import IModelService from "../services/interfaces/IModelService";
import {ModelConstructor, ModelState} from "./model/Model";
import Datasource from "./model/Datasource";
import {RouteEvent} from "./Event";
import IEventService from "../services/interfaces/IEventService";
import {CallbackFunctionVariadic} from "../helpers/types";

/**
 * Global state point of the application 
 * 
 * When the destination is requested in some way, {@link Router} directs the
 * application to reach the state required by the destination.
 * {@link RouteDestination} is the type of objects describing the state.
 */
type RouteDestination = unknown;

/**
 * An object defining conditions of a {@link RouteDestination} and related attributes
 * 
 * The conditions expressed by {@link Route.pathexp} attribute.
 * 
 * @category Core
 */
export type Route<RD extends RouteDestination> = {
    /* Route name, required to reverse */
    name: string;
    /* 
     * the unique state of application to apply when the route is reached
     */
    destination: RD|CallbackFunctionVariadic;
    /**
     * Path expression of the route
     *
     * This is the template of how the path should look to be matched to this path.
     *
     * A static path expression is a simple URL-like string (i.e. /pages/list).
     * A dynamic path expression contains parameters (i.e. /pages/{int}/edit),
     * where '{int}' is a positional integer parameter.
     *
     * Dynamic path expression format supports 'int' and 'str' types, so values extracted
     * from the path will be automatically converted to their corresponding types.
     */
    pathexp: string|RegExp;
}

/**
 * A {@link Route} that points to a {@link Router} method instead of custom {@link RouteDestination}.
 * 
 * @category Core
 */
type MethodRoute = Route<null> & {
    method_name: string;
}

/**
 * A universal form of {@link Route}
 * which contains auxiliary data to simplify route resolve/reversal
 * 
 * @category Core
 */
type CompiledRoute<RD extends RouteDestination> = {
    /**
     * human-readable path of the route containing typed substitutions
     */
    pathexp?: string;
    /**
     * either of regexp compiled from the regexp
     * or user-defined regexp
     */
    regexp: RegExp;
    /* 
     * parameter types extracted from pathexp 
     * which is required as the regexp does not contain type validation 
     */
    param_types?: string[];
    /** 
     * either of route identifier or arbitrary callback function 
     * to call when the destiation is reached 
     */
    destination?: RD|CallbackFunctionVariadic;
    /** name of the {@link Router} method to call when the app is directed to the route */
    method_name?: string;
}

/**
 * A regular expression to find parameters in path expressions
 * Example: '/path/to/{int}/page/of/the/{str}/document'
 */
const PATHEXP_REGEXP = /({([a-z0-9]+)})/gmi;

/**
 * {@link Router} method decorator
 *
 * Use this decorator when it's needed to make the method of {@link Router} a handler of a route.
 *
 * Note that {@link Router} will check that the number of arguments in the method matches the number
 * of parameters of the path.
 * It's also not available to use regexps as route's path in this case.
 *
 * @param pathexp   path expression, see {@link Route.pathexp}
 * @param name      route name
 * 
 * @category Core
 */
export function route(pathexp: string, name: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.method_routes == null) {
            target.method_routes = [];
        }

        target.method_routes.push({
            name, pathexp, destination: propertyKey, method_name: propertyKey
        });

        return target;
    }
}

/**
 * Helper interface to describe the object that constructs {@see Router} objects.
 * 
 * @category Core
 */
export interface IRouter {
    new(svc_model: IModelService, svc_event: IEventService): Router<any>;
}

/**
 * A mechanism of matching application destinations and its string paths
 *
 * This class provides methods of the matching between them in both directions.
 *
 * Correct matching of a state point and its string path is called a route ({@link Route}).
 * An application's global state point is called a route destination ({@link RouteDestination}).
 *
 * A destination is handled by {@link Router.direct} method or by other arbitrary method of the class.
 * A string path can be either a path expression (see {@link Route.pathexp})
 * or a regular expression ({@link RegExp}, it has some restrictions).
 *
 * For this reason, routes can be specified in tho ways:
 *  - The default way is to set public `routes` property.
 *  - A {@link route} decorator may be applied to specific method of {@link Router} class.
 * 
 * @category Core
 */
export default abstract class Router<RD extends RouteDestination> {
    /* A public list of routes that is usually specified for specific application's router, if needed */
    protected routes: Route<RD>[];

    /* A list of routers generated by {@see route} decorator function */
    private readonly method_routes: MethodRoute[];

    /* Compiled route map to simplify path resolving */
    private readonly routes_compiled: Map<string, CompiledRoute<RD>> = new Map();

    /* An instance of model service to give a read-only access to model repository. */
    private svc_model: IModelService;

    /* An instance of event service to give an ability to emit events from the router. */
    private svc_event: IEventService;

    constructor(svc_model: IModelService, svc_event: IEventService) {
        this.svc_model = svc_model;
        this.svc_event = svc_event;
    }

    /**
     * Handles destination change
     *
     * Specific implementation may need to reflect the path change;
     * this method is called automatically when the path changes and resolves to the destination.
     *
     * @param destination   a destination to handle
     * @param params        optional destination parameters  
     */
    protected abstract direct(destination: RD, params?: (number|string)[]): void;

    public addRoutes(routes: Route<RD>[]) {
        if (!this.routes) {
            this.routes = routes;
        } else {
            this.routes.concat(routes);
        }
    }

    /**
     * Launches the router
     *
     * Specific implementation may need to make some initial actions
     * (i.e. extract a model and gather initial data).
     */
    public launch() {
        this.compileRoutes();
    };

    /**
     * Makes the redirection
     *
     * This methods resolves a path and calls corresponding handler according to its route.
     * If the path is invalid (there are no corresponding routes), shows the error and skips.
     *
     * @param path path requested by the user
     */
    public async redirect(path: string) {
        const resolved = this.resolve(path);

        if (resolved == null) {
            console.error(`Cannot resolve path '${path}'. Route map used to resolve`, this.routes_compiled);
            return;
        }

        const [route, params] = resolved;

        if (route.method_name) {
            if (Object(this)[route.method_name]) {
                await (this as any)[route.method_name](...params);
            } else {
                throw new Error(`${this.constructor.name}.${route.method_name} is undefined`);
            }

            return;
        }

        if (route.destination instanceof Function) {
            await route.destination(...params);
        } else {
            await this.direct(route.destination, params);
        }

        return resolved;
    }

    /**
     * Gets path of route based on its name and fills the parameters if required
     *
     * This method can be used in couple with {@see redirect} to reproduce user experience or to redirect
     * programmatically a bit more cleaner (but it's still not recommended to do in production).
     *
     * Please note that regexp-based routes cannot be reversed due to its arbitrariness and diversity.
     *
     * @param route_name    name of the route
     * @param params        route parameters if required
     * 
     * @returns path of the route
     */
    public reverse(route_name: string, params?: (string|number)[]): string {
        const route = this.routes_compiled.get(route_name);

        if (!route) {
            throw Error(`Route ${route_name} does not exist!`);
        }

        if (!route.pathexp) {
            throw Error(`Route ${route_name} cannot be reversed because it uses raw regexp to resolve`);
        }

        let i = 0;

        const path = route.pathexp.replace(PATHEXP_REGEXP, (full, _, type) => {
            let param_value = params[i];

            if (param_value == null) {
                throw Error(`Not enough parameters provided for route ${route_name}`);
            }

            i++;

            if (type === 'int') {
                param_value = Number(param_value);
                if (Number.isNaN(param_value)) {
                    throw new Error(`Invalid parameter type (${i-1})`);
                }

                return String(param_value);
            }

            if (type === 'str') return String(param_value);

            throw new Error(
                `Invalid type literal in path of '${route_name}' route: '${type}', 'int' or 'str' expected`
            );
        });

        return path;
    }

    /**
     * Finds route and parses parameters for a given path.
     *
     * @param path path to be resolved
     */
    public resolve(path: string): null|[CompiledRoute<RD>, (string|number)[]] {
       for (const route of this.routes_compiled.values()) {
            const params = Router.applyPathToRegexp(route.regexp, route.param_types, path);

            if (params != null) {
                return [route, params];
            }
        }

        return null;
    }

    /**
     * Finds model in the global repository
     *
     * This method isolates {@see Route} inheritors to write access to repository, enabling to
     * retrieve the {@see Model} instances.
     *
     * Note that the models may not be available before the {@see launch} method is called
     * because of the {@see IRoutingService} lifecycle conventions (see {@see RoutingServiceProvider} ).
     *
     * @param model_type        a Model class to retrieve the instance of
     * @param suppress_errors   do not throw an exception if no instance is found
     */
    protected getModel<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>
        (model_type: M, suppress_errors: boolean = false): InstanceType<M>
    {
        const model = this.svc_model.retrieve(model_type);

        if (!model && !suppress_errors) {
            throw new Error(`Model ${model_type.name} does not exists. Did you forgot to register it?`);
        }

        return model;
    }

    protected emit<E>(evt: RouteEvent<E>) {
        return this.svc_event.emit(evt);
    }

    /**
     * Prepares initial routes to resolve and reverse algorithms
     *
     * Each route that contains a 'pathexp' (path expression) will be converted to a
     * {@see CompiledRoute} which contains regexp version of the 'pathexp'. This format is more suitable to
     * program to match a path instead of human-readable 'pathexp' format.
     */
    private compileRoutes() {
        let routes        = this.routes;
        let method_routes = this.method_routes;

        if (!routes) {
            routes = [];
        }

        if (!method_routes) {
            method_routes = [];
        }

        for (const route of [...routes, ...method_routes]) {
            const {name: route_name, pathexp, destination} = route;

            const method_name = (route as any).method_name;

            if (destination == null && method_name == null) {
                throw new Error(`Route '${route_name}' sets neither 'destination' nor 'method_name'`);
            }

            if (typeof pathexp === 'string') {
                const [regexp, param_types] = this.compileRoute(route_name, pathexp, destination, method_name);
                this.routes_compiled.set(route_name, {pathexp, regexp, destination, method_name, param_types});
            } else if (pathexp instanceof RegExp) {
                this.routes_compiled.set(route_name, {regexp: pathexp, destination, method_name});
            } else {
                throw new Error(`Route '${route_name}' sets neither string path nor RegExp`);
            }
        }
    }

    /**
     * Converts specific route to Router's universal format
     *
     * @param route_name    original route name, will be used in {@see reverse}
     * @param pathexp       original path expression to convert to regexp format
     * @param method_name   a method to call if specified
     */
    private compileRoute(
        route_name: string,
        pathexp: string,
        destination: RD|CallbackFunctionVariadic,
        method_name: string
    ): [RegExp, string[]]
    {
        const param_types: string[] = [];

        let param_qty = 0;

        let regexp_str = pathexp.replace(PATHEXP_REGEXP, (full, _, type): string => {
            param_types.push(type);
            param_qty += 1;

            if (type === 'int') return "([0-9]+)";
            if (type === 'str') return "([a-zA-Z0-9]+)";

            throw new Error(
                `Invalid type literal in path of '${route_name}' route: '${type}', 'int' or 'str' expected`
            );
        });

        regexp_str = regexp_str.replace(/\//g, '\\/');

        regexp_str += '$';

        if (method_name) {
            if (Object(this)[method_name]) {
                // get number of required arguments
                let param_qty_required = (this as any)[method_name].length;

                if (param_qty_required > param_qty) {
                    throw new Error(
                        `Route '${route_name}' path specifies less arguments than ${this.constructor.name}.${method_name}`
                    );
                }

            } else {
                throw new Error(`Method named '${method_name}' does not exist in ${this.constructor.name}`);
            }
        }

        if (destination instanceof Function) {
            // get number of required arguments
            let param_qty_required = destination.length;

            if (param_qty_required > param_qty) {
                throw new Error(
                    `Route '${route_name}' path specifies less arguments than its callback handler function`
                );
            }
        }

        return [new RegExp(regexp_str, 'g'), param_types];
    }

    /**
     * Extracts parameter values from the `path` by given `regexp` and `types`
     * 
     * @param regexp    generated regexp from the compiled route  
     * @param types     types extracted from the pathexp
     * @param path      original path to extract the parameter values from
     * 
     * @returns parameter values listed in the same order as in the path
     */
    private static applyPathToRegexp(regexp: RegExp, types: null|string[], path: string): null|(string|number)[] {
        let params: (string|number)[] = [];

        const param_qty_expected = (new RegExp(regexp.source + '|')).exec('').length - 1;

        // reset regexp state
        regexp.lastIndex = 0;
        let match = regexp.exec(path);

        // minus one original
        if (!match || (match.length - 1 !== param_qty_expected)) return null;

        match.shift();

        for (let i = 0; i < match.length; i++) {
            const param_value = match[i],
                  type = types[i];

            if (type === 'int') {
                let value = Number(param_value);
                if (Number.isNaN(value)) return null;
                if (!Number.isInteger(value)) return null;

                params.push(value);
            }

            if (type === 'str') {
                params.push(param_value);
            }
        }

        return params;
    }
}