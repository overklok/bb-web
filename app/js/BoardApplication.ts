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

import BoardPresenter from "./presenters/common/BoardPresenter";

import BoardModel from "./models/common/BoardModel";
import ConnectionModel from "./models/common/ConnectionModel";

import BoardView from "./views/common/BoardView";

import "../css/global.less";
import SingleViewComposer from "./core/base/view/viewcomposers/SingleViewComposer";
import AsynchronousDatasource from "./core/base/model/datasources/AsynchronousDatasource";
import IEventService from "./core/services/interfaces/IEventService";

interface BoardApplicationConfig extends AppConf {
    silent?: boolean;
    readonly?: boolean;
    layout_name?: string;
}

class BoardApplication extends Application<BoardApplicationConfig> {
    protected config: BoardApplicationConfig;
    private ads: AdaptiveAsyncDatasource;
    private bb: BoardModel;

    protected providerClasses(): Array<IServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
        ];
    }

    protected setup() {
        const svc_event = this.instance(IEventService);

        let data_sources: AsynchronousDatasource[] = [];

        if (!this.config.silent) {
            data_sources = [
                new QtIPCDatasource(),
                new SocketDatasource('127.0.0.1', 8005),
            ]
        }

        this.ads = new AdaptiveDatasource(data_sources);

        this.instance(IViewService).setRootWidgets(SingleViewComposer, 'main');
    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const svc_view = this.instance(IViewService),
              svc_model = this.instance(IModelService);

        svc_view.registerWidgetTypes({
            main: {view_type: BoardView.BoardView, presenter_types: [BoardPresenter], view_props: {
                schematic: true,
                readonly: this.config.readonly,
            }},
        });

        svc_model.launch(this.ads);
        svc_model.register(ConnectionModel, this.ads);
        svc_model.register(BoardModel, this.ads, {
            layout_name: this.config.layout_name,
        });

        this.bb = svc_model.retrieve(BoardModel);

        this.instance(IViewService).compose(element);
    }
}

declare global {
  interface Window {
    Application: any;
  }
}

window.Application = BoardApplication;
