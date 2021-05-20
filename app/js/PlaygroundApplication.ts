import Application, {AppConf} from "./core/Application";

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

import DummyDatasource from "./core/base/model/datasources/DummyDatasource";

import "../css/global.less";

import layouts_config from "./configs/playground/layouts";
import widgets_config from "./configs/playground/widgets";
import ModalModel from "./core/models/ModalModel";
import CodeModel from "./models/common/CodeModel";
import KeyboardModel from "./core/models/KeyboardModel";
import IEventService from "./core/services/interfaces/IEventService";

interface PlaygroundApplicationConfig extends AppConf {
    silent?: boolean;
    verbose?: boolean;
    readonly?: boolean;
    layout_name?: string;
}

class PlaygroundApplication extends Application<PlaygroundApplicationConfig> {
    public bb: BoardModel;
    public cm: CodeModel;

    private ads: AdaptiveAsyncDatasource;
    private dds: DummyDatasource;

    protected config: PlaygroundApplicationConfig;

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
            new SocketDatasource('127.0.0.1', 8005),
        ]);

        this.dds = new DummyDatasource();

        const svc_model = this.instance(IModelService);

        svc_model.launch(this.ads);
        svc_model.register(KeyboardModel, this.dds);
        svc_model.register(ModalModel, this.dds);
        svc_model.register(LayoutModel, this.dds, layouts_config);
        svc_model.register(CodeModel, this.ads);
        svc_model.register(BoardModel, this.ads, {
            layout_name: this.config.layout_name,
        });
    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const svc_view = this.instance(IViewService),
              svc_model = this.instance(IModelService);

        widgets_config.widgets.board.view_props.readonly = this.config.readonly;
        widgets_config.widgets.board.view_props.verbose = this.config.verbose;

        svc_view.setRootWidgets(widgets_config.composer, widgets_config.root);
        svc_view.registerWidgetTypes(widgets_config.widgets);

        this.bb = svc_model.retrieve(BoardModel);
        this.cm = svc_model.retrieve(CodeModel);

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
    Application: any;
  }
}

window.Application = PlaygroundApplication;
