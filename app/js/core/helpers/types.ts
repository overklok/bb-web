import {IViewProps, IViewState, View} from "../base/View";
import Presenter from "../base/Presenter";
import ViewComposer from "../base/ViewComposer";

type ViewType<P extends IViewProps, S extends IViewState> = (new (props: P, context?: any) => View<P, S>);
type PresenterType<P extends IViewProps, S extends IViewState> = (new (view: View<P, S>, context?: any) => Presenter<View<P, S>>);

type WidgetInfo = {alias: string, label: string};

type ViewComposerAny = ViewComposer<any, any>;

export {ViewType, PresenterType, WidgetInfo, ViewComposerAny};