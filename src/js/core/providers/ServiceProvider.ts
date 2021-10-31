import Application from "../Application";

/**
 * @category Core
 * @subcategory Service
 */
export default interface IServiceProvider {
    new(app: Application): ServiceProvider;
}

/**
 * @category Core
 * @subcategory Service
 */
export abstract class ServiceProvider {
    protected app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public setup(): void {};
    public boot(): void {};
    public register(): void {};
}
