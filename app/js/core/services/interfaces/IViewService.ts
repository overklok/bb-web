import Application from "../../Application";
import ViewConnector from "../../base/view/ViewConnector";
import {IViewProps, IViewState, View} from "../../base/view/View";
import {PresenterType, ViewComposerType, ViewType} from "../../helpers/types";
import ViewComposer, {IVCProps, IVCState} from "../../base/view/ViewComposer";

export type Widget = {connector: ViewConnector, view_type: typeof View, label?: string};

export type WidgetType = {
    view_type: ViewType<IViewProps, IViewState>,
    presenter_types: PresenterType<IViewProps, IViewState>[],
    label?: string
};

/**
 * @abstract
 */
export default class IViewService {
    protected readonly app: Application;
    protected widgets: {[key: string]: Widget};
    protected widget_types: WidgetType[];
    protected widget_type_key: string;

    constructor(app: Application) {
        this.app = app;
        this.widgets = {};
    }

    public setup(view_composer: ViewComposerType<any, any>, widget_types: string | WidgetType[] = [])   {throw new Error('abstract')};
    public compose(element: HTMLElement)                                                                {throw new Error('abstract')};
    public registerWidgetTypes(widget_types: {[key: string]: WidgetType})                               {throw new Error('abstract')};
}