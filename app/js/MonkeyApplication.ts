import Application from "./core/Application";

import IViewService from "./core/services/interfaces/IViewService";
import IModelService from "./core/services/interfaces/IModelService";

import IServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import EventServiceProvider from "./core/providers/EventServiceProvider";

import QtIPCDatasource from "./core/models/datasources/QtIPCDatasource";
import SocketDatasource from "./core/models/datasources/SocketDatasource";
import AdaptiveDatasource from "./core/models/datasources/AdaptiveAsyncDatasource";
import AdaptiveAsyncDatasource from "./core/models/datasources/AdaptiveAsyncDatasource";

import LayoutModel from "./core/models/LayoutModel";
import BoardModel from "./models/common/BoardModel";
import ConnectionModel from "./models/common/ConnectionModel";

import DummyDatasource from "./core/base/model/datasources/DummyDatasource";

import "../css/global.less";

import layouts_config from "./configs/monkey/layouts";
import widgets_config from "./configs/monkey/widgets";
import ModalModel from "./core/models/ModalModel";
import TestkitModel from "./models/monkey/TestkitModel";
import BoardLogModel from "./models/monkey/BoardLogModel";
import OverlayViewComposer from "./core/base/view/viewcomposers/OverlayViewComposer";
import LayoutView from "./core/views/layout/LayoutView";
import LayoutPresenter from "./core/presenters/LayoutPresenter";
import ModalView from "./core/views/modal/ModalView";
import ModalPresenter from "./core/presenters/ModalPresenter";

class MonkeyApplication extends Application {
    public bb: BoardModel;
    public log: BoardLogModel;

    private ads: AdaptiveAsyncDatasource;
    private dds: DummyDatasource;

    protected providerClasses(): Array<IServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
        ];
    }

    protected setup() {
        this.ads = new AdaptiveDatasource([
            new QtIPCDatasource(),
            // new SocketDatasource('127.0.0.1', 8005),
        ]);

        this.dds = new DummyDatasource();
    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const svc_view = this.instance(IViewService),
              svc_model = this.instance(IModelService);

        svc_view.setRootWidgets(widgets_config.composer, widgets_config.root);
        svc_view.registerWidgetTypes(widgets_config.widgets);

        svc_model.register(ModalModel, this.dds);
        svc_model.register(LayoutModel, this.dds, layouts_config);

        svc_model.launch(this.ads);
        svc_model.register(ConnectionModel, this.ads);
        svc_model.register(BoardModel, this.ads);
        svc_model.register(TestkitModel, this.dds);
        svc_model.register(BoardLogModel, this.dds);

        this.bb = svc_model.retrieve(BoardModel);
        this.log = svc_model.retrieve(BoardLogModel);

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

window.Application = MonkeyApplication;
