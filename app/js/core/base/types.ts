import {IViewProps, IViewState, View} from "./View";
import Presenter from "./Presenter";

export type ViewType<P extends IViewProps, S extends IViewState> = (new (props: P, context?: any) => View<P, S>);
export type PresenterType<P extends IViewProps, S extends IViewState> = (new (view: View<P, S>, context?: any) => Presenter<View<P, S>>);