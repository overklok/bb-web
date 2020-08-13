import ServiceProvider from "./ServiceProvider";
import Application from "../Application";
import IViewService from "../services/interfaces/IViewService";
import ViewService from "../services/ViewService";
import OverlayViewComposer from "../base/view/viewcomposers/OverlayViewComposer";
import LayoutView from "../views/layout/LayoutView";
import LayoutPresenter from "../presenters/LayoutPresenter";
import ModalView from "../views/modal/ModalView";
import ModalPresenter from "../presenters/ModalPresenter";
import ModalModel from "../models/ModalModel";
import DummyDatasource from "../base/model/datasources/DummyDatasource";
import IModelService from "../services/interfaces/IModelService";

export default class ViewServiceProvider extends ServiceProvider {
    register() {
        this.app.bind(IViewService, function (app: Application): any {
            return new ViewService(app);
        });
    }

    public boot() {
        // this.app.instance(IModelService).register(ModalModel, new DummyDatasource());

        this.app.instance(IViewService).setup(
            OverlayViewComposer,
        [
                {view_type: LayoutView, presenter_types: [LayoutPresenter], view_options: {}},
                {view_type: ModalView, presenter_types: [ModalPresenter]}
            ]
        );
    }
}