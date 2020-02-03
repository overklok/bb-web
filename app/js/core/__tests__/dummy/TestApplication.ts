import Application from "../../Application";
import TestServiceProvider from "./TestServiceProvider";

export default class TestApplication extends Application {
    protected providers(): Array<Function> {
        return [
            TestServiceProvider.constructor
        ];
    }
}