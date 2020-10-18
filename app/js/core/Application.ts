import IServiceProvider, {ServiceProvider} from "./providers/ServiceProvider";
import IConstructable from "./helpers/IConstructable";
import {coverOptions} from "./helpers/functions";

// passed by DefinePlugin in Webpack config
declare var __VERSION__: string;

export interface AppConf {}

export default abstract class Application<AC extends AppConf = AppConf> {
    protected config: AppConf;

    private bindings:   Map<any, Function> = new Map();
    private instances:  Map<any, any>      = new Map();

    private providers:  Array<ServiceProvider> = [];

    public readonly version: string;

    constructor(config?: AppConf) {
        this.configure(config);

        this.init();
        this.setup();
        this.boot();

        this.version = __VERSION__;
        console.log(`Loaded ${this.version}`);
    }

    /**
     * Поставщики Служб
     */
    protected providerClasses(): Array<IServiceProvider> {
        return [];
    }

    protected configure(config: AppConf = {}): void {
        this.config = coverOptions(this.config, config);
    };

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

        this.build();
    }

    protected setup(): void {};

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

    public abstract run(settings: any): void;

    /**
     * Зарегистрировать обвязку
     */
    public bind<V extends IConstructable>(abstrakt: V|string, concrete: Function) {
        this.bindings.set(abstrakt, concrete);
    }

    public instance<V extends IConstructable>(abstrakt: V|string): InstanceType<V> {
        const inst = this.instances.get(abstrakt);

        if (inst == null) {
            const itypename = typeof abstrakt === 'string' ? abstrakt : abstrakt.name;

            throw new Error(`InstanceType "${itypename}" has not been bound to this application`);
        }

        return inst;
    }

    public exists<V extends IConstructable>(abstrakt: V|string): boolean {
        return this.instances.has(abstrakt);
    }

    protected build() {
        for (const [abstrakt, concrete] of this.bindings.entries()) {
            const instance = concrete(this);
            this.instances.set(abstrakt, instance);
        }
    }
}