import Application from "../Application";
import TestServiceProvider from "./TestServiceProvider";
import ServiceProvider from "../providers/ServiceProvider";
import ViewServiceProvider from "../providers/ViewServiceProvider";
import IViewService from "../services/interfaces/IViewService";
import ConfigServiceProvider from "../providers/ConfigServiceProvider";
import IConfigService from "../services/interfaces/IConfigService";

import layouts from './configs/layouts';
import views from './configs/views';

import {LayoutConfig} from "../configs/LayoutConfig";
import {ViewConfig} from "../configs/ViewConfig";

class TestApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            TestServiceProvider,
            ViewServiceProvider,
            ConfigServiceProvider,
        ];
    }

    protected setup() {
        this.instance(IConfigService).configure(ViewConfig, views);
        this.instance(IConfigService).configure(LayoutConfig, layouts);
    }

    run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        this.instance(IViewService).compose(element);
    }

    setMode(mode: string) {
        this.instance(IViewService).switch(mode);
    }
}

declare global {
  interface Window {
    Application: typeof Application;
  }
}

window.Application = TestApplication;

export default TestApplication;
