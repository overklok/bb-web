import Application from "../Application";
import TestServiceProvider from "./TestServiceProvider";
import ServiceProvider from "../support/ServiceProvider";
import LayoutServiceProvider from "../providers/LayoutServiceProvider";
import ILayoutService from "../service/interfaces/ILayoutService";
import ConfigServiceProvider from "../providers/ConfigServiceProvider";
import IConfigService from "../service/interfaces/IConfigService";

import {LayoutConfiguration} from "../layout/types";
import layouts from './configs/layouts';

class TestApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            TestServiceProvider,
            LayoutServiceProvider,
            ConfigServiceProvider,
        ];
    }

    protected setup() {
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
