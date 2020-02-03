import ServiceProvider from "./support/ServiceProvider";

export default class Application {
    private services: Array<ServiceProvider> = [];

    /**
     * Поставщики Служб
     */
    protected providers(): Array<String> {
        return [];
    }

    /**
     * Инициализировать Приложение
     */
    protected init() {
        for (const provider of this.providers()) {

        }

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