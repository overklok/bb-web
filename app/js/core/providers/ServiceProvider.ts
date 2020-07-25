import Application from "../Application";

export default class ServiceProvider {
    protected app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public boot(): void {};
    public register(): void {};
}
