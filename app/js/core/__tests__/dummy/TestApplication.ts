import Application from "../../Application";
import TestServiceProvider from "./TestServiceProvider";
import ServiceProvider from "../../support/ServiceProvider";

export default class TestApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            TestServiceProvider
        ];
    }
}