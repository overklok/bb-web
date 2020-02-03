import Application from "../Application";
import TestServiceProvider from "./TestServiceProvider";

export default class TestApplication extends Application {
    protected providers(): Array<String> {
        return [
            TestServiceProvider.name
        ];
    }
}