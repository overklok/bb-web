import Application from "../../Application";
import ViewConnector from "../../base/ViewConnector";
import {IViewOptions, IViewProps, IViewState, View} from "../../base/view/View";
import {PresenterType, ViewComposerType, ViewType} from "../../helpers/types";

export type Widget<O extends IViewOptions> = {
    connector: ViewConnector,
    view_type: ViewType<O, any>,
    view_options?: O,
    label?: string
};

export type WidgetType<O extends IViewOptions> = {
    view_type: ViewType<O, IViewState>;
    presenter_types: PresenterType<View<O, IViewState>>[];
    view_options?: O;
    label?: string;
};

/**
 * @abstract
 */
export default class IViewService {
    protected readonly app: Application;
    protected widgets: {[key: string]: Widget<any>};
    protected widget_types: WidgetType<any>[] = [];
    protected widget_type_key: string;

    constructor(app: Application) {
        this.app = app;
        this.widgets = {};
    }

    public setup(view_composer: ViewComposerType<any, any>, widget_types: string | WidgetType<any>[] = [])  {throw new Error('abstract')};
    public compose(element: HTMLElement)                                                                    {throw new Error('abstract')};
    public registerWidgetTypes(widget_types: {[key: string]: WidgetType<any>})                              {throw new Error('abstract')};
    public getViews(): { [name: string]: any }                                                              {throw new Error('abstract')};
}