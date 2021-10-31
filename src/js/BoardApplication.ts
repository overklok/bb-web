import Application, {AppConf} from "./core/Application";

import IViewService, {WidgetType} from "./core/services/interfaces/IViewService";
import IModelService from "./core/services/interfaces/IModelService";

import IServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import EventServiceProvider from "./core/providers/EventServiceProvider";

import QtIPCDatasource from "./core/models/datasources/QtIPCDatasource";
import SocketDatasource from "./core/models/datasources/SocketDatasource";
import HttpDatasource from "./core/base/model/datasources/HttpDatasource";
import DummyDatasource from "./core/base/model/datasources/DummyDatasource";
import AdaptiveDatasource from "./core/models/datasources/AdaptiveAsyncDatasource";
import AsynchronousDatasource from "./core/base/model/datasources/AsynchronousDatasource";

import BoardPresenter from "./presenters/common/BoardPresenter";
import ToastPresenter from "./core/presenters/ToastPresenter";
import DebugDumpBoardPresenter from "./presenters/debug/DebugDumpBoardPresenter";
import DebugCheckBoardPresenter from "./presenters/debug/DebugCheckBoardPresenter";

import LogModel from "./models/common/LogModel";
import BoardModel from "./models/common/BoardModel";
import ModalModel from "./core/models/ModalModel";
import ConnectionModel from "./models/common/ConnectionModel";
import AdminCheckModel from "./models/debug/DebugCheckModel";

import BoardView from "./views/common/BoardView";
import ToastView from "./core/views/ToastView";
import DebugDumpBoardView from "./views/debug/DebugDumpBoardView";

import OverlayViewComposer from "./core/base/view/viewcomposers/OverlayViewComposer";

import "../css/global.less";
import CodeModel from "./models/common/CodeModel";
import i18n_init from "~/i18n/config";

interface BoardApplicationConfig extends AppConf {
    silent?: boolean;
    verbose?: boolean;
    readonly?: boolean;
    layout_name?: string;
    allow_dumps?: boolean;
    allow_check?: boolean;
    server_addr: string;
    server_port: number;
}

/**
 * test
 */
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

    protected async setup() {
        i18n_init('en', ['main']);

        let data_sources: AsynchronousDatasource[] = [];

        if (!this.config.silent) {
            data_sources = [
                new QtIPCDatasource(),
                new SocketDatasource('127.0.0.1', 8085),
            ]
        }

        const dds = new DummyDatasource();
        const ads = new AdaptiveDatasource(data_sources);
        const hds = new HttpDatasource(this.config.server_addr, this.config.server_port);

        const svc_model = this.instance(IModelService);

        svc_model.launch(ads);
        svc_model.register(ConnectionModel, ads);
        svc_model.register(AdminCheckModel, dds);
        svc_model.register(ModalModel,  dds);
        svc_model.register(LogModel, hds);
        svc_model.register(CodeModel, ads);
        svc_model.register(BoardModel, ads, {
            layout_name: this.config.layout_name,
        });

        this.bb = svc_model.retrieve(BoardModel);
    }

    run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const wgt_types: WidgetType<any>[] = [
            {
                view_type: BoardView.BoardView,
                presenter_types: [BoardPresenter],
                view_props: {
                    schematic: true,
                    readonly: this.config.readonly,
                    verbose: this.config.verbose,
                },
            },
        ];

        // Handle dump responses / check verdicts by toasts
        if (this.config.allow_dumps || this.config.allow_check) {
            wgt_types.push(
                {
                    view_type: ToastView, 
                    presenter_types: [ToastPresenter]
                }
            );
        }

        // Make dump requests by clicking button
        if (this.config.allow_dumps) {
            wgt_types.push(
                {
                    view_type: DebugDumpBoardView.DebugDumpBoardView,
                    presenter_types: [DebugDumpBoardPresenter],
                }
            );
        }

        // Handle board check verdicts by BoardView
        if (this.config.allow_check) {
            wgt_types[0].presenter_types.push(DebugCheckBoardPresenter);
        }

        this.instance(IViewService).setRootWidgets(OverlayViewComposer, wgt_types);

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
