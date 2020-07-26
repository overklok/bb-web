import {IViewProps, IViewState, View} from "../base/View";
import Presenter from "../base/Presenter";
import ViewComposer, {IVCProps, IVCState} from "../base/ViewComposer";

type WidgetInfo = {alias: string, label: string};

type ViewType<P extends IViewProps, S extends IViewState> = (new (props: P, context?: any) => View<P, S>);
type PresenterType<P extends IViewProps, S extends IViewState> = (new (view: View<P, S>, context?: any) => Presenter<View<P, S>>);
type ViewComposerType<P extends IVCProps, S extends IVCState> = (new (props: P, context?: any) => ViewComposer<P, S>);

type ViewComposerAny = ViewComposer<any, any>;

export {ViewType, PresenterType, ViewComposerType, WidgetInfo, ViewComposerAny};