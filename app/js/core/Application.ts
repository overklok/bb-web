import ServiceProvider from "./support/ServiceProvider";
import IBindable from "./helpers/IBindable";

export default abstract class Application {
    private bindings:   Map<string|IBindable, Function> = new Map();
    private instances:  Map<string|IBindable, any>      = new Map();

    private providers:  Array<ServiceProvider> = [];

    constructor() {
        this.init();
        this.setup();
        this.boot();
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

    public abstract run(): void;

    /**
     * Зарегистрировать обвязку
     */
    public bind<V extends IBindable>(abstrakt: V|string, concrete: Function) {
        this.bindings.set(abstrakt, concrete);
    }

    public instance<V extends IBindable>(abstrakt: V|string): InstanceType<V> {
        return this.instances.get(abstrakt);
    }

    protected build() {
        for (const [abstrakt, concrete] of this.bindings.entries()) {
            const instance = concrete(this);
            this.instances.set(abstrakt, instance);
        }
    }
}