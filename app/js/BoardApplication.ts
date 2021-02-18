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
import OverlayViewComposer from "./core/base/view/viewcomposers/OverlayViewComposer";
import DumpSnapshotView from "./views/controls/DumpSnapshotView";
import DumpSnapshotPresenter from "./presenters/controls/DumpSnapshotPresenter";
import HttpDatasource from "./core/base/model/datasources/HttpDatasource";
import LogModel from "./models/common/LogModel";
import ModalModel from "./core/models/ModalModel";
import DummyDatasource from "./core/base/model/datasources/DummyDatasource";
import ModalView from "./core/views/modal/ModalView";
import ModalPresenter from "./core/presenters/ModalPresenter";
import PopoverLessonPresenter from "./presenters/lesson/PopoverLessonPresenter";
import ToastPresenter from "./core/presenters/ToastPresenter";
import ToastView from "./core/views/modal/ToastView";

interface BoardApplicationConfig extends AppConf {
    silent?: boolean;
    verbose?: boolean;
    readonly?: boolean;
    layout_name?: string;
    server_addr: string;
    server_port: number;
}

class BoardApplication extends Application<BoardApplicationConfig> {
    private bb: BoardModel;

    protected defaultConfig() {
        return {
            server_addr: '127.0.0.1',
            server_port: 8000,
        }
    }

    protected providerClasses(): Array<IServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
        ];
    }

    protected setup() {
        let data_sources: AsynchronousDatasource[] = [];

        if (!this.config.silent) {
            data_sources = [
                // new QtIPCDatasource(),
                new SocketDatasource('127.0.0.1', 8085),
            ]
        }

        const dds = new DummyDatasource();
        const ads = new AdaptiveDatasource(data_sources);
        const hds = new HttpDatasource(this.config.server_addr, this.config.server_port);

        const svc_model = this.instance(IModelService);

        svc_model.launch(ads);
        svc_model.register(ConnectionModel, ads);
        svc_model.register(ModalModel,  dds);
        svc_model.register(LogModel, hds);
        svc_model.register(BoardModel, ads, {
            layout_name: this.config.layout_name,
        });

        this.bb = svc_model.retrieve(BoardModel);
    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        this.instance(IViewService).setRootWidgets(OverlayViewComposer, [
            {
                view_type: BoardView.BoardView,
                presenter_types: [BoardPresenter],
                view_props: {
                    schematic: true,
                    readonly: this.config.readonly,
                    verbose: this.config.verbose,
                }
            },
            {
                view_type: DumpSnapshotView.DumpSnapshotView,
                presenter_types: [DumpSnapshotPresenter],
            },
            {view_type: ToastView, presenter_types: [ToastPresenter]},
        ]);

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
    BoardApplication: any;
  }
}

window.BoardApplication = BoardApplication;
