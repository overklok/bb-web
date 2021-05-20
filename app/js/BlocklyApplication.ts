import Application, {AppConf} from "./core/Application";

import IViewService from "./core/services/interfaces/IViewService";
import IModelService from "./core/services/interfaces/IModelService";

import IServiceProvider from "./core/providers/ServiceProvider";
import ViewServiceProvider from "./core/providers/ViewServiceProvider";
import ModelServiceProvider from "./core/providers/ModelServiceProvider";
import EventServiceProvider from "./core/providers/EventServiceProvider";

import DummyDatasource from "./core/base/model/datasources/DummyDatasource";
import AdminBlocklyPresenter from "./presenters/common/AdminBlocklyPresenter";
import AdminCodeModel from "./models/common/AdminCodeModel";
import BlocklyView from "./views/common/BlocklyView";
import SingleViewComposer from "./core/base/view/viewcomposers/SingleViewComposer";

import "../css/global.less";

interface BlocklyApplicationConfig extends AppConf {
    all_blocks?: boolean;
    workspace_zoom?: number;
    edit_limits: boolean;
}

class BlocklyApplication extends Application<BlocklyApplicationConfig> {
    protected config: BlocklyApplicationConfig;
    private dds: DummyDatasource;
    private code: AdminCodeModel;

    protected providerClasses(): Array<IServiceProvider> {
        return [
            ViewServiceProvider,
            ModelServiceProvider,
            EventServiceProvider,
        ];
    }

    protected setup() {
        this.dds = new DummyDatasource();

        this.instance(IViewService).setRootWidgets(SingleViewComposer, 'main');
    }

    async run(element: HTMLElement) {
        if (element == null) throw new Error("Please pass a valid DOM element to run an application");

        const svc_view = this.instance(IViewService),
              svc_model = this.instance(IModelService);

        svc_view.registerWidgetTypes({
            main: {
                view_type: BlocklyView,
                presenter_types: [AdminBlocklyPresenter],
                view_props: {
                    force_all_blocks: this.config.all_blocks,
                    edit_limits: this.config.edit_limits,
                    zoom: this.config.workspace_zoom
                }
            },
        });

        svc_model.register(AdminCodeModel, this.dds, {});

        this.code = svc_model.retrieve(AdminCodeModel);

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
        BlocklyApplication: any;
    }
}

window.BlocklyApplication = BlocklyApplication;
