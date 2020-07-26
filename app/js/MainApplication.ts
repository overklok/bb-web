import Application from "./core/Application";
import ServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import IViewService from "./core/services/interfaces/IViewService";

import EventServiceProvider from "./core/providers/EventServiceProvider";
import IModelService from "./core/services/interfaces/IModelService";
import {LayoutModel} from "./core/models/LayoutModel";

import layouts_config from "./configs/layouts";
import widgets_config from "./configs/widgets";

class MainApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider
        ];
    }

    protected setup() {

    }

    run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        this.instance(IViewService).registerWidgetTypes(widgets_config);
        this.instance(IViewService).compose(element);

        this.instance(IModelService).register(LayoutModel, layouts_config);
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
