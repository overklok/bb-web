import Application from "../Application";
import TestServiceProvider from "./TestServiceProvider";
import ServiceProvider from "../support/ServiceProvider";
import LayoutServiceProvider from "../providers/LayoutServiceProvider";
import ILayoutService from "../service/interfaces/ILayoutService";
import ConfigServiceProvider from "../providers/ConfigServiceProvider";
import IConfigService from "../service/interfaces/IConfigService";

import layouts from './configs/layouts';
import {LayoutConfiguration} from "../configuration/LayoutConfiguration";

class TestApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            TestServiceProvider,
            LayoutServiceProvider,
            ConfigServiceProvider,
        ];
    }

    protected setup() {
        // @ts-ignore
        this.instance(IConfigService).configure(LayoutConfiguration, layouts);
    }

    run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        this.instance(ILayoutService).compose(element);
    }
}

declare global {
  interface Window {
    Application: typeof Application;
  }
}

window.Application = TestApplication;

export default TestApplication;
