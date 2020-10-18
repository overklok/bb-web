import IModelService from "../services/interfaces/IModelService";
import {ModelConstructor, ModelState} from "./model/Model";
import Datasource from "./model/Datasource";

type RouteDestination = unknown;

type Route<RD extends RouteDestination> = {
    name: string;
    pathexp: string|RegExp;
    destination: RD;
}

type MethodRoute = Route<null> & {
    method_name: string;
}

type CompiledRoute<RD extends RouteDestination> = {
    regexp: RegExp;
    pathexp?: string;
    param_types?: string[];
    destination?: RD;
    method_name?: string;
}

const PATHEXP_REGEXP = /({([a-z0-9]+)})/gmi;

export function route(name: string, pathexp: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (target.method_routes == null) {
            target.method_routes = [];
        }

        target.method_routes.push({
            name, pathexp, destination: propertyKey
        });

        return target;
    }
}

export interface IRouter {
    new(svc_model: IModelService): Router<any>;
}

export default abstract class Router<RD extends RouteDestination> {
    private svc_model: IModelService;
    public readonly routes: Route<RD>[] = [];
    private readonly method_routes: MethodRoute[]  = [];
    private readonly routes_compiled: Map<string, CompiledRoute<RD>> = new Map();

    constructor(svc_model: IModelService) {
        this.svc_model = svc_model;

        this.compileRoutes();
    }

    public abstract launch(): void;
    protected abstract direct(destination: RD): void;

    public redirect(path: string) {
        const resolved = this.resolve(path);

        if (resolved == null) {
            console.error(`Cannot resolve path '${path}'. Route map used to resolve`, this.routes_compiled);
            return;
        }

        const [route, params] = resolved;

        if (route.method_name) {
            if (Object(this).hasOwnProperty(route.method_name)) {
                (this as any)[route.method_name](...params);
            }
        }

        if (route.destination) {
            this.direct(route.destination);
        }
    }

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
            const param_value = params[i];

            if (param_value == null) {
                throw Error(`Not enough parameters provided for route ${route_name}`);
            }

            if (type === 'int') return Number(param_value).toString();
            if (type === 'str') return String(param_value);

            throw new Error(
                `Invalid type literal in path of '${route_name}' route: '${type}', 'int' or 'str' expected`
            );
        });

        return path;
    }

    public resolve(path: string): null|[CompiledRoute<RD>, (string|number)[]] {
        for (const route of Object.values(this.routes_compiled)) {
            const params = Router.applyPathToRegexp(route.regexp, path, route.param_types);

            if (params != null) {
                return [route, params];
            }
        }

        return null;
    }

    protected getModel<MS extends ModelState, DS extends Datasource, M extends ModelConstructor<MS, DS>>
        (model_type: M, suppress_errors: boolean = false): InstanceType<M>
    {
        const model = this.svc_model.retrieve(model_type);

        if (!model && !suppress_errors) {
            throw new Error(`Model ${model_type.name} does not exists. Did you forgot to register it?`);
        }

        return model;
    }

    private compileRoutes() {
        for (const route of [...this.routes, ...this.method_routes]) {
            const {name: route_name, pathexp, destination} = route;

            const method_name = (route as any).method_name;

            if (destination == null && method_name == null) {
                throw new Error(`Route '${route_name}' sets neither 'destination' nor 'method_name'`);
            }

            if (typeof pathexp === 'string') {
                const [regexp, param_types] = this.compileRoute(route_name, pathexp, method_name);
                this.routes_compiled.set(route_name, {pathexp, regexp, destination, method_name, param_types});
            } else if (pathexp instanceof RegExp) {
                this.routes_compiled.set(route_name, {regexp: pathexp, destination, method_name});
            } else {
                throw new Error(`Route '${route_name}' sets neither string path nor RegExp`);
            }
        }
    }

    private compileRoute(route_name: string, pathexp: string, method_name: string): [RegExp, string[]] {
        const param_types: string[] = [];

        // const pathexp_escaped = pathexp.replace(/\//g, "_");

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

        if (method_name) {
            if (Object(this).hasOwnProperty(method_name)) {
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

        return [new RegExp(regexp_str, 'g'), param_types];
    }

    private static applyPathToRegexp(regexp: RegExp, path: string, types: null|string[]): null|(string|number)[] {
        let params: (string|number)[] = [];

        const param_qty_expected = (new RegExp(regexp.source + '|')).exec('').length - 1;

        let match = path.match(regexp);

        // minus one original
        if (match.length - 1 !== param_qty_expected) return null;

        let i = 0;

        while (match = regexp.exec(path)) {
            const param_value = match[2],
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

            i += 1;
        }

        return params;
    }
}