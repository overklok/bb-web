import Application from "./core/Application";

import IViewService from "./core/services/interfaces/IViewService";
import IModelService from "./core/services/interfaces/IModelService";

import ServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import EventServiceProvider from "./core/providers/EventServiceProvider";

import QtIPCDatasource from "./core/models/datasources/QtIPCDatasource";
import SocketDatasource from "./core/models/datasources/SocketDatasource";
import AdaptiveDatasource from "./core/models/datasources/AdaptiveAsyncDatasource";
import AdaptiveAsyncDatasource from "./core/models/datasources/AdaptiveAsyncDatasource";

import BoardMonitorPresenter from "./presenters/monitor/BoardMonitorPresenter";

import BreadboardModel from "./models/common/BreadboardModel";
import ConnectionModel from "./models/common/ConnectionModel";

import BoardView from "./views/board/BoardView";

import "../css/global.less";
import SingleViewComposer from "./core/base/view/viewcomposers/SingleViewComposer";

class MonitorApplication extends Application {
    private ads: AdaptiveAsyncDatasource;
    protected providerClasses(): Array<typeof ServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
        ];
    }

    protected setup() {
        this.ads = new AdaptiveDatasource([
            new QtIPCDatasource(),
            new SocketDatasource('127.0.0.1', 8005),
        ]);
    }

    protected boot() {
        super.boot();

        this.instance(IViewService).setup(SingleViewComposer, 'main');
    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const svc_view = this.instance(IViewService),
              svc_model = this.instance(IModelService);

        svc_view.registerWidgetTypes({
            main: {view_type: BoardView, presenter_types: [BoardMonitorPresenter], view_options: {
                schematic: true,
            }},
        });

        svc_model.launch(this.ads);
        svc_model.register(ConnectionModel, this.ads);
        svc_model.register(BreadboardModel, this.ads);

        this.instance(IViewService).compose(element);
    }
}

declare global {
  interface Window {
    Application: typeof Application;
  }
}

window.Application = MonitorApplication;