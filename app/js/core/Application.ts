import ServiceProvider from "./support/ServiceProvider";

export default class Application {
    private instances:  {[index: string]:any} = {};
    private bindings:   {[index: string]:any} = {};
    private aliases:    {[index: string]:any} = {};

    private providers:  Array<ServiceProvider> = [];

    constructor() {
        this.init();
    }

    /**
     * Поставщики Служб
     */
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [];
    }

    /**
     * Инициализировать Приложение
     */
    protected init() {
        // регистрация Служб
        for (const provider_class of this.providerClasses()) {
            const provider = new provider_class(this);
            this.providers.push(provider);
            provider.register();
        }
    }

    /**
     * Запустить Приложение
     */
    protected boot() {
        // запуск Служб
        for (const provider of this.providers) {
            provider.boot();
        }

        delete this.providers;
    }

    /**
     * Зарегистрировать обвязку
     */
    public bind(abstrakt: string, concrete: Function|string|null, shared: boolean = false) {
        this.dropStaleInstances(abstrakt);

        // If no concrete type was given, we will simply set the concrete type to the
        // abstrakt type. After that, the concrete type to be registered as shared
        // without being forced to state their classes in both of the parameters.
        if (concrete === null) {
            concrete = abstrakt;
        }

        // If the factory is not a function, it means it is just a class name which is
        // bound into this container to the abstrakt type and we will just wrap it
        // up inside its own function to give us more convenience when extending.
        if (!(concrete instanceof Function)) {
            concrete = this.getConcreteFunction(abstrakt, concrete);
        }

        this.bindings[abstrakt] = {concrete, shared};
    }

    public build(concrete: string) {
        //
    }

    public isShared(abstrakt: string): boolean {
        return  abstrakt in this.instances ||
                abstrakt.shared
    }

    public getAlias(abstrakt: string): string {
        if (!(abstrakt in this.aliases)) {
            return abstrakt;
        }

        return this.getAlias(this.aliases[abstrakt]);
    }

    protected resolve(abstrakt: string, parameters: Array<any> = [], raise_events: boolean = true) {
        abstrakt = this.getAlias(abstrakt);

        // If an instance of the type is currently being managed as a singleton we'll
        // just return an existing instance instead of instantiating new instances
        // so the developer can keep using the same objects instance every time.
        if (abstrakt in this.instances) {
            return this.instances[abstrakt];
        }

        // this.with[] = parameters

        concrete = this.getConcreteFunction()
    }

    protected dropStaleInstances(abstrakt: string) {
        delete this.instances[abstrakt];
        delete this.aliases[abstrakt];
    }

    protected getConcreteFunction(abstrakt: string, concrete: string): Function {
        return function (app: Application, parameters: Array<any> = []) {
            if (abstrakt == concrete) {
                return app.build(concrete);
            }

            return app.resolve(abstrakt, parameters, false);
        }
    }

    protected getConcrete(abstrakt) {

    }
}