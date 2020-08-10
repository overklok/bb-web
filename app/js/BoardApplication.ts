import Application from "./core/Application";
import ServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import IViewService from "./core/services/interfaces/IViewService";

import EventServiceProvider from "./core/providers/EventServiceProvider";
import BoardView from "./views/BoardView";

class BoardApplication extends Application {
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
        ];
    }

    protected setup() {

    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        this.instance(IViewService).registerWidgetTypes({
            main: {view_type: BoardView, presenter_types: []},
        });

        this.instance(IViewService).compose(element);
    }
}

declare global {
  interface Window {
    Application: typeof Application;
  }
}

window.Application = BoardApplication;
