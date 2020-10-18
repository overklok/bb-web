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

import layouts_config from "./configs/teacher/layouts";
import widgets_config from "./configs/teacher/widgets";

import "../css/global.less";

class MainApplication extends Application {
    private mdl_layout: any;
    protected providerClasses(): Array<IServiceProvider> {
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

        const dds = new DummyDatasource();

        const ads = new AdaptiveDatasource([
            new QtIPCDatasource(),
            new SocketDatasource('127.0.0.1', 8085),
        ]);

        const hds = new HttpDatasource('127.0.0.1', 8000);

        this.instance(IModelService).launch(ads);

        this.instance(IModelService).register(UserModel, hds);
        this.instance(IModelService).register(LayoutModel, dds, layouts_config);
        this.instance(IModelService).register(BoardModel, ads);

        hds.registerMiddleware([
            new JWTAuthMiddleware(
                this.instance(IModelService).retrieve(UserModel)
            )
        ]);

        this.instance(IViewService).registerWidgetTypes(widgets_config);

        this.instance(IViewService).compose(element);

        this.mdl_layout = this.instance(IModelService).retrieve(LayoutModel);
    }
}

declare global {
  interface Window {
    Application: typeof Application;
  }
}

window.Application = MainApplication;
