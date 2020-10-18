import Application from "../Application";

export default interface IServiceProvider {
    new(app: Application): ServiceProvider;
}

export abstract class ServiceProvider {
    protected app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public setup(): void {};
    public boot(): void {};
    public register(): void {};
}
