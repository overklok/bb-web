import {IViewOptions, IViewProps, IViewState, View} from "../base/view/View";
import Presenter from "../base/Presenter";
import ViewComposer, {IVCProps, IVCState} from "../base/view/ViewComposer";
import IModelService from "../services/interfaces/IModelService";

type WidgetInfo = {alias: string, label: string};

type ViewType<O extends IViewOptions, S extends IViewState> =
    (new (props: IViewProps<O>) => View<O, S>);

type PresenterType<V extends View<IViewOptions, IViewState>> =
    (new (view: V, svc_model: IModelService) => Presenter<V>);

type ViewComposerType<P extends IVCProps, S extends IVCState> =
    (new (props: P) => ViewComposer<P, S>);

type ViewComposerAny = ViewComposer<any, any>;

export {ViewType, PresenterType, ViewComposerType, WidgetInfo, ViewComposerAny};