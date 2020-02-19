import Application from "../../Application";
import TestServiceProvider from "./TestServiceProvider";
import ServiceProvider from "../../support/ServiceProvider";
import LayoutServiceProvider from "../../providers/LayoutServiceProvider";
import ILayoutService from "../../service/interfaces/ILayoutService";
import ConfigServiceProvider from "../../providers/ConfigServiceProvider";
import IConfigService from "../../service/interfaces/IConfigService";

import layouts from './configs/layouts';
import LayoutConfiguration from "../../layout/interfaces/LayoutConfiguration";

export default class TestApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            TestServiceProvider,
            LayoutServiceProvider,
            ConfigServiceProvider,
        ];
    }

    protected afterInit() {
        this.instance(IConfigService).configure(LayoutConfiguration, layouts);
    }

    run() {
        this.instance(ILayoutService).compose();
    }
}