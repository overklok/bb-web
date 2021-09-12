import Application from "./core/Application";
import IViewService from "./core/services/interfaces/IViewService";
import IModelService from "./core/services/interfaces/IModelService";
import IRoutingService from "./core/services/interfaces/IRoutingService";

import IServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import EventServiceProvider from "./core/providers/EventServiceProvider";
import RoutingServiceProvider from "./core/providers/RoutingServiceProvider";

import HttpDatasource from "./core/base/model/datasources/HttpDatasource";
import DummyDatasource from "./core/base/model/datasources/DummyDatasource";
import QtIPCDatasource from "./core/models/datasources/QtIPCDatasource";
import SocketDatasource from "./core/models/datasources/SocketDatasource";
import AdaptiveDatasource from "./core/models/datasources/AdaptiveAsyncDatasource";
import { FakeHttpRule } from "./core/base/model/datasources/HttpDatasource";

import CSRFMiddleware from "./core/models/middlewares/CSRFMiddleware";
import JWTAuthMiddleware from "./core/models/middlewares/JWTAuthMiddleware";

import UserModel from "./models/UserModel";
import SettingsModel from "./core/models/SettingsModel";

import layouts_config from "./configs/main/layouts";
import widgets_config from "./configs/main/widgets";
import settings_config from "./configs/main/settings";

import ModalModel from "./core/models/ModalModel";
import LayoutModel from "./core/models/LayoutModel";
import KeyboardModel from "./core/models/KeyboardModel";
import CourseModel from "./models/lesson/CourseModel";
import ProgressModel from "./models/lesson/ProgressModel";
import CodeModel from "./models/common/CodeModel";
import BoardModel from "./models/common/BoardModel";
import LessonModel from "./models/lesson/LessonModel";
import ConnectionModel from "./models/common/ConnectionModel";

import MainRouter from "./routers/MainRouter";
import ServerModel from "./models/common/ServerModel";

import i18n_init from "~/i18n/config";

require("css/global.less");

interface MainAppConf {
    allow_demo: boolean;
    no_menu: boolean;
    server_addr: string;
    server_port: number;
    sock_addr: string;
    sock_port: number;
    fake_http_responses?: FakeHttpRule[];
    lang: string;
}

/**
 * test
 */
class MainApplication extends Application<MainAppConf> {
    protected defaultConfig() {
        return {
            allow_demo: true,
            no_menu: false,
            server_addr: '127.0.0.1',
            server_port: 8000,
            sock_addr: '127.0.0.1',
            sock_port: 8085,
            lang: 'en',
        }
    }

    protected providerClasses(): Array<IServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
            RoutingServiceProvider,
        ];
    }

    protected async setup() {
        i18n_init(this.config.lang);

        const svc_routing = this.instance(IRoutingService),
              svc_model = this.instance(IModelService);

        const dds = new DummyDatasource();

        const ads = new AdaptiveDatasource([
            new QtIPCDatasource(),
            new SocketDatasource(this.config.sock_addr, this.config.sock_port),
        ]);

        const hds = new HttpDatasource(this.config.server_addr, this.config.server_port);

        if (this.config.fake_http_responses) {
            hds.setFakeRules(this.config.fake_http_responses);
        }

        svc_model.launch(ads);

        svc_model.register(ModalModel,      dds);
        svc_model.register(UserModel,       hds);
        svc_model.register(CourseModel,     hds);
        svc_model.register(SettingsModel,   dds, {config: settings_config(this.config.allow_demo)});
        svc_model.register(LessonModel,     hds);
        svc_model.register(ServerModel,     hds);

        svc_model.register(ConnectionModel, ads);
        svc_model.register(CodeModel,       ads);
        svc_model.register(BoardModel,      ads);

        svc_model.register(KeyboardModel,   dds);
        svc_model.register(ProgressModel,   hds);
        svc_model.register(LayoutModel,     dds, layouts_config);

        hds.registerMiddleware([
            new CSRFMiddleware(),
            new JWTAuthMiddleware(
                this.instance(IModelService).retrieve(UserModel)
            )
        ]);

        svc_routing.setRouter(MainRouter);
    }

    run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const {root: wgt_root, widgets, composer} = widgets_config(this.config.no_menu);

        const svc_view = this.instance(IViewService);
        svc_view.setRootWidgets(composer, wgt_root);
        svc_view.registerWidgetTypes(widgets);

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

window.Application = MainApplication;
