import Application from "./core/Application";
import ServiceProvider from "./core/support/ServiceProvider";
import LayoutServiceProvider from "./core/providers/LayoutServiceProvider";
import ConfigServiceProvider from "./core/providers/ConfigServiceProvider";
import ILayoutService from "./core/service/interfaces/ILayoutService";
import IConfigService from "./core/service/interfaces/IConfigService";

import views from "./core/__tests__/configs/views";
import layouts from "./core/__tests__/configs/layouts";
import {ViewConfig} from "./core/configs/ViewConfig";
import {LayoutConfig} from "./core/configs/LayoutConfig";

class MainApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            LayoutServiceProvider,
            ConfigServiceProvider,
        ];
    }

    protected setup() {
        this.instance(IConfigService).configure(ViewConfig, views);
        this.instance(IConfigService).configure(LayoutConfig, layouts);
    }

    run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        this.instance(ILayoutService).compose(element);
    }

    setMode(mode: string) {
        this.instance(ILayoutService).switch(mode);
    }
}

declare global {
  interface Window {
    Application: typeof Application;
  }
}

window.Application = MainApplication;
