import ServiceProvider from "./support/ServiceProvider";

export default class Application {
    private services: Array<ServiceProvider> = [];

    /**
     * Поставщики Служб
     */
    protected providers(): Array<Function> {
        return [];
    }

    /**
     * Инициализировать Приложение
     */
    protected init() {
        for (const provider of this.providers()) {
            this.services.push(provider())
        }

        console.log(this.services);

        // регистрация всех Служб
        // создание их экземпляров
    }

    /**
     * Запустить Приложение
     */
    protected boot() {
        // загрузить все Службы
    }
}