import Application from "./core/Application";
import ServiceProvider from "./core/support/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ConfigServiceProvider from "./core/providers/ConfigServiceProvider";
import IViewService from "./core/services/interfaces/IViewService";
import IConfigService from "./core/services/interfaces/IConfigService";

import views from "./configs/views";
import layouts from "./configs/layouts";
import {ViewConfig} from "./core/configs/ViewConfig";
import {LayoutConfig} from "./core/configs/LayoutConfig";
import EventServiceProvider from "./core/providers/EventServiceProvider";

class MainApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            ViewServiceProvider,
            ConfigServiceProvider,
            EventServiceProvider
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

window.Application = MainApplication;
