import IModelService from "../services/interfaces/IModelService";

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
    destination?: RD;
    method_name?: string;
}

const PATHEXP_REGEXP = /({([a-z0-9]+):([a-z0-9]+)})/gmi;

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

export default abstract class Router<RD extends RouteDestination> {
    private svc_model: IModelService;
    public readonly routes: Route<RD>[];
    private readonly method_routes: MethodRoute[];
    private readonly routes_compiled: Map<string, CompiledRoute<RD>>;

    protected constructor(svc_model: IModelService) {
        this.svc_model = svc_model;

        this.compileRoutes();
    }

    protected abstract direct(destination: RD): void;

    public redirect(path: string) {
        const resolved = this.resolve(path);

        if (resolved == null) {
            console.error('Route map used to resolve', this.routes_compiled);
            throw new Error("Cannot resolve path");
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

    public reverse(name: string, params?: (string|number)[]): string {
        const route = this.routes_compiled.get(name);

        if (!route) {
            throw Error(`Route ${name} does not exist!`);
        }

        if (!route.regexp) {
            throw Error(`Route ${name} cannot be reversed because it uses raw regexp to resolve`);
        }

        // TODO
        const path = '';

        return path;
    }

    public resolve(path: string): null|[CompiledRoute<RD>, (string|number)[]] {
        for (const route of Object.values(this.routes_compiled)) {
            const params = Router.applyPathToRegexp(route.regexp, path);

            if (params != null) {
                return [route, params];
            }
        }

        return null;
    }

    private compileRoutes() {
        for (const route of [...this.routes, ...this.method_routes]) {
            const {name: route_name, pathexp, destination} = route;

            const method_name = (route as any).method_name;

            if (destination == null && method_name == null) {
                throw new Error(`Route '${route_name}' sets neither 'destination' nor 'method_name'`);
            }

            if (typeof pathexp === 'string') {
                const [regexp] = this.compileRoute(route_name, pathexp);
                this.routes_compiled.set(route_name, {pathexp, regexp, destination, method_name});
            } else if (pathexp instanceof RegExp) {
                this.routes_compiled.set(route_name, {regexp: pathexp, destination, method_name});
            } else {
                throw new Error(`Route '${route_name}' sets neither string path nor RegExp`);
            }
        }
    }

    private compileRoute(route_name: string, pathexp: string, method_name: string): [RegExp, string[]] {
        const param_names: string[] = [];

        const pathexp_escaped = pathexp.replace(/\//g, "_");

        let param_qty = 0;

        let regexp_str = pathexp_escaped.replace(PATHEXP_REGEXP, (full, _, type, name): string => {
            param_names.push(name);
            param_qty += 1;

            if (type === 'int') return "([0-9]+)";
            if (type === 'str') return "([a-zA-Z0-9]+)";

            throw new Error(
                `Invalid type literal in path of '${route_name} route': '${type}', 'int' or 'str' expected`
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

        return [new RegExp(regexp_str, 'g'), param_names];
    }

    private static applyPathToRegexp(regexp: RegExp, path: string): null|(string|number)[] {
        let params: string|number[] = [];

        const param_qty_expected = (new RegExp(regexp.source + '|')).exec('').length - 1;

        let match = path.match(regexp);

        // minus one original
        if (match.length - 1 !== param_qty_expected) return null;

        return params;
    }
}