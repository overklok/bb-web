import IServiceProvider, {ServiceProvider} from "./providers/ServiceProvider";
import IConstructable from "./helpers/IConstructable";
import defaultsDeep from "lodash/defaultsDeep";

// passed by DefinePlugin in Webpack config
declare const __VERSION__: string;

/**
 * Base app configuration
 */
export interface AppConf {}

/**
 * Root application singleton
 * 
 * Manages service providers for the application.
 * Defines application lifecycle stages.
 * Implements services' lifecycles.
 * 
 * @category Core
 */
export default abstract class Application<AC extends AppConf = AppConf> {
    /** app configuration (if required) */
    protected config: AC;

    /** a "string/classname" to "service instance generator function" mapping */
    private bindings:   Map<any, Function> = new Map();
    /** a "string/classname" to "service instance" mapping */
    private instances:  Map<any, any>      = new Map();

    /** list of {@link ServiceProvider} instances to extract services from */
    private providers:  Array<ServiceProvider> = [];

    /** app version */
    public readonly version: string;

    /**
     * Instantiates the application
     * 
     * @param config configuration object
     */
    constructor(config?: AC) {
        // Apply default values to the empty config object
        this.configure(this.defaultConfig());
        // Apply user-defined values to default configs 
        this.configure(config);

        this.execLifecycle();

        this.version = __VERSION__;
        console.log(`Loaded ${this.version}`);
    }

    private async execLifecycle() {
        this.initProviders();
        // Setup services provided
        this.setupProviders();
        // Customize services if needed
        this.setup();
        // Boot the services
        this.bootProviders();
    }

    /**
     * @returns default configuration object
     */
    protected defaultConfig(): AC {
        return {} as AC;
    }

    /**
     * Returns {@link ServiceProvider} classes reqiuired for the application.
     * 
     * Override to require the classes.
     * 
     * @returns ServiceProvider classes to instaniate 
     */
    protected providerClasses(): Array<IServiceProvider> {
        return [];
    }

    /**
     * Applies custom app configuration over defaults
     * 
     * @param config overriding app config values
     */
    protected configure(config: AC): void {
        this.config = defaultsDeep(config, this.config) as AC;
    };

    /**
     * Instantiates {@link ServiceProvider}s and registers it in the application.
     * 
     * An instance of {@link SerivceProvider} gets access to the {@link Application}
     * in order to suddenly request another services if needed for the service.
     * 
     * If the {@link ServiceProvider} gives an access to the service it provides,
     * it should call the {@link bind} method in order to use the service instance from
     * the applcation.
     * 
     * After this stage, it's available to request service instances by its classnames
     * via {@link instance} method in the application.
     */
    private initProviders() {
        // Register providers
        for (const provider_class of this.providerClasses()) {
            const provider = new provider_class(this);
            this.providers.push(provider);
            provider.register();
        }

        this.build();
    }

    protected async setup(): Promise<void> {};

    /**
     * Setups the services
     * 
     * At this stage, provider can request another service instances from the application. 
     */
    private setupProviders() {
        // настройка Служб
        for (const provider of this.providers) {
            provider.setup();
        }
    }
    
    /**
     * Launches the service instances
     * 
     * Some services need a signal that the application is running and it's time to run.
     * For example, {@link ViewService} renders the DOM tree when booted up.
     */
    private bootProviders() {
        // запуск Служб
        for (const provider of this.providers) {
            provider.boot();
        }

        delete this.providers;
    }

    /**
     * Runs the appliaction after all services is booted up.
     * 
     * Convenience method to launch applications.
     * 
     * @param settings 
     */
    public abstract run(settings: any): void;

    /**
     * Registers the service instance generatior function
     * 
     * Each {@link ServiceProvider} calls this method when registering in the app
     * to give the instance of service it created for the application.
     */
    public bind<V extends IConstructable>(abstrakt: V|string, concrete: Function) {
        this.bindings.set(abstrakt, concrete);
    }

    /**
     * Finds a service instance by classname
     * 
     * Note that the instance should be bound by the {@link bind} method and then remapped by the {@link build} method.
     * 
     * @param abstrakt a classname of the instance
     * @param throw_error throw an error instad of returning null if the instance is not found
     * 
     * @returns an instance available by the classname or arbitrary string
     */
    public instance<V extends IConstructable>(abstrakt: V|string, throw_error: boolean = true): InstanceType<V> {
        const inst = this.instances.get(abstrakt);

        if (inst == null) {
            const itypename = typeof abstrakt === 'string' ? abstrakt : abstrakt.name;

            if (throw_error) {
                throw new Error(`InstanceType "${itypename}" has not been bound to this application`);
            }
        }

        return inst;
    }

    /**
     * @param abstrakt a classname of the instance
     * 
     * @returns whether an instance exists in the application by its classname
     */
    public exists<V extends IConstructable>(abstrakt: V|string): boolean {
        return this.instances.has(abstrakt);
    }

    /**
     * Remaps all bindings created by existing {@link ServiceProvider}s in order
     * to request them by their classnames. 
     */
    protected build() {
        for (const [abstrakt, concrete] of this.bindings.entries()) {
            const instance = concrete(this);
            this.instances.set(abstrakt, instance);
        }
    }
}