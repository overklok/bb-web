import {IViewProps, IViewState, View} from "../base/view/View";
import Presenter from "../base/Presenter";
import ViewComposer, {IVCProps, IVCState} from "../base/view/ViewComposer";
import IModelService from "../services/interfaces/IModelService";
import IRoutingService from "../services/interfaces/IRoutingService";

type WidgetInfo = {alias: string, label: string};

type ViewType<P extends IViewProps, S extends IViewState> =
    (new (props: P) => View<P, S>);

type PresenterType<V extends View<IViewProps, IViewState>> =
    (new (svc_model: IModelService, svc_routing?: IRoutingService) => Presenter<V>);

type ViewComposerType<P extends IVCProps, S extends IVCState> =
    (new (props: P) => ViewComposer<P, S>);

type ViewComposerAny = ViewComposer<any, any>;

type CallbackFunctionVariadic = (...args: any[]) => void;

export {ViewType, PresenterType, ViewComposerType, WidgetInfo, ViewComposerAny, CallbackFunctionVariadic};