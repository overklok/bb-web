import Application from "./core/Application";
import IViewService from "./core/services/interfaces/IViewService";
import IModelService from "./core/services/interfaces/IModelService";

import IServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import EventServiceProvider from "./core/providers/EventServiceProvider";

import HttpDatasource from "./core/models/datasources/HttpDatasource";
import QtIPCDatasource from "./core/models/datasources/QtIPCDatasource";
import SocketDatasource from "./core/models/datasources/SocketDatasource";
import DummyDatasource from "./core/base/model/datasources/DummyDatasource";
import AdaptiveDatasource from "./core/models/datasources/AdaptiveAsyncDatasource";

import LayoutModel from "./core/models/LayoutModel";
import BoardModel from "./models/common/BoardModel";

import JWTAuthMiddleware from "./core/models/middlewares/JWTAuthMiddleware";

import UserModel from "./models/UserModel";

import layouts_config from "./configs/main/layouts";
import widgets_config from "./configs/main/widgets";
import routes_config from "./configs/main/routes";

import "../css/global.less";
import RoutingServiceProvider from "./core/providers/RoutingServiceProvider";
import IRoutingService from "./core/services/interfaces/IRoutingService";
import LayoutRouter from "./core/routers/LayoutRouter";
import KeyboardModel from "./core/models/KeyboardModel";
import CodeModel from "./models/common/CodeModel";

class MainApplication extends Application {
    protected providerClasses(): Array<IServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
            RoutingServiceProvider,
        ];
    }

    protected setup() {
        const dds = new DummyDatasource();

        const ads = new AdaptiveDatasource([
            // new QtIPCDatasource(),
            // new SocketDatasource('127.0.0.1', 8085),
        ]);

        const hds = new HttpDatasource('127.0.0.1', 8000);

        const svc_routing = this.instance(IRoutingService),
              svc_model = this.instance(IModelService);

        svc_model.launch(ads);
        svc_model.register(UserModel, hds);
        svc_model.register(CodeModel, ads);
        svc_model.register(BoardModel, ads);
        svc_model.register(KeyboardModel, dds);
        svc_model.register(LayoutModel, dds, layouts_config);

        hds.registerMiddleware([
            new JWTAuthMiddleware(
                this.instance(IModelService).retrieve(UserModel)
            )
        ]);

        svc_routing.setRouter(LayoutRouter);
        svc_routing.loadRoutes(routes_config);
    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const svc_view = this.instance(IViewService);
        svc_view.registerWidgetTypes(widgets_config);

        this.instance(IViewService).compose(element);
    }

    get views() {
        return this.instance(IViewService).getViews();
    }

    get models() {
        return this.instance(IModelService).getModels();
    }
}

declare global {
  interface Window {
    Application: typeof Application;
  }
}

window.Application = MainApplication;
